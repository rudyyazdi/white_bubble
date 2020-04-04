import {
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLList,
  GraphQLFieldResolver,
  GraphQLEnumType,
} from 'graphql';
import { Db } from 'mongodb';
import AttributeDal, { IAttributeDal } from 'src/domain/attribute/Dal'

interface IBubble {
  text: string
}

export interface IBooleanAttribute {
  name: string
  kind: 'Boolean'
}

export interface IIntegerAttribute {
  name: string
  kind: 'Integer'
}

export interface IEnumAttribute {
  name: string
  kind: 'Enum'
  options: string[]
}

export interface IContext {
  db: Db,
  dal: {
    attribute: IAttributeDal
  }
}

export type IAttribute = IBooleanAttribute | IIntegerAttribute | IEnumAttribute

const kindToGraphqlTypeMap = (attribute: IAttribute) => {
  switch (attribute.kind) {
    case 'Boolean': return GraphQLBoolean;
    case 'Integer': return GraphQLInt;
    case 'Enum': {
      const values = attribute.options.reduce((acc: { [key: string]: {} }, option) => { acc[option] = {}; return acc }, {})
      const { name } = attribute;
      const enumTypeConfig = {
        name,
        values
      }
      return new GraphQLEnumType(enumTypeConfig)
    };
  }
}

const createSchema = (attributes: IAttribute[]) => {
  const bubbles: IBubble[] = []

  const bubbleTypeFields: { [key: string]: { type: any } } = {
    text: {
      type: GraphQLNonNull(GraphQLString),
    },
  }

  attributes.forEach((attribute: IAttribute) => {
    bubbleTypeFields[attribute.name] = {
      type: kindToGraphqlTypeMap(attribute)
    }
  })

  const bubbleType = new GraphQLObjectType({
    name: 'Bubble',
    fields: bubbleTypeFields
  });

  const attributeTypeFields = {
    name: {
      type: GraphQLNonNull(GraphQLString),
    },
    kind: {
      type: GraphQLNonNull(new GraphQLEnumType({
        name: 'kind',
        values: {
          Boolean: {},
          Enum: {},
          Integer: {}
        }
      }))
    },
    options: {
      type: GraphQLList(GraphQLString)
    }
  }

  const attributeType = new GraphQLObjectType({
    name: 'Attribute',
    fields: attributeTypeFields
  });

  const queryType = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      searchBubbles: {
        type: GraphQLList(bubbleType),
        resolve() {
          return bubbles;
        },
      },
      searchAttributes: {
        type: GraphQLList(attributeType),
        resolve() {
          return attributes;
        }
      }
    },
  })

  const addBubble: GraphQLFieldResolver<any, any> = (_source, arg) => {
    const bubble = arg as IBubble
    bubbles.push(bubble)
    return bubble;
  }

  const addAttribute: GraphQLFieldResolver<any, IContext> = (_source, arg, { dal: { attribute: attributeDal } }) => {
    const attribute = arg as IAttribute
    attributeDal.insertOne(attribute)
    attributes.push(attribute)
    return attribute;
  }

  const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      addBubble: {
        type: bubbleType,
        args: bubbleTypeFields,
        resolve: addBubble,
      },
      addAttribute: {
        type: attributeType,
        args: attributeTypeFields,
        resolve: addAttribute,
      },
    },
  })

  return new GraphQLSchema({
    query: queryType,
    mutation: mutationType,
    types: [bubbleType, attributeType]
  })
}

export default createSchema