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
  GraphQLFieldConfigArgumentMap
} from 'graphql';
import { Db } from 'mongodb';
import { IAttributeDal } from 'src/domain/attribute/Dal'
import { IBubbleDal } from 'src/domain/bubble/Dal'

export interface IBubble {
  text: string
  [key: string]: boolean | string | number
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
    bubble: IBubbleDal
  }
}

type IFieldResolver = GraphQLFieldResolver<any, IContext>

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
  const addBubbleFields: { [key: string]: { type: any } } = {
    text: {
      type: GraphQLNonNull(GraphQLString),
    },
  }

  attributes.forEach((attribute: IAttribute) => {
    addBubbleFields[attribute.name] = {
      type: kindToGraphqlTypeMap(attribute)
    }
  })

  const bubbleType = new GraphQLObjectType({
    name: 'Bubble',
    fields: addBubbleFields
  });

  const addAttributeFields = {
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
    fields: addAttributeFields
  });

  const searchBubblesFields: GraphQLFieldConfigArgumentMap = {
    textMatches: {
      type: GraphQLString,
    }
  }

  const legalQueriesForAttribute = {
    Boolean: ['Eq', 'In'],
    Integer: ['Eq', 'In', 'Gt', 'Gte', 'Lt', 'Lte'],
    Enum: ['Eq', 'In', 'Matches'],
  }

  attributes.forEach(({ kind, name }: IAttribute): void => {
    const legalQueries = legalQueriesForAttribute[kind]
    legalQueries.forEach((query) => {
      const argType = ((s) => {
        switch (s) {
          case 'Boolean::Eq': return GraphQLBoolean
          case 'Boolean::In': return GraphQLList(GraphQLBoolean)
          case 'Integer::In': return GraphQLList(GraphQLInt)
          case 'Enum::Eq': return GraphQLString
          case 'Enum::Matches': return GraphQLString
          case 'Enum::In': return GraphQLList(GraphQLString)
          default: return GraphQLInt
        }
      })(`${kind}::${query}`)
      searchBubblesFields[name + query] = { type: argType }
    })
  })

  const searchAttributes: IFieldResolver = () => attributes
  const searchBubbles: IFieldResolver = async (_source, arg, { dal: { bubble: { search } } }) => {
    return await search(arg)
  }

  const queryType = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      searchBubbles: {
        type: GraphQLList(bubbleType),
        resolve: searchBubbles,
        args: searchBubblesFields
      },
      searchAttributes: {
        type: GraphQLList(attributeType),
        resolve: searchAttributes
      }
    },
  })

  const addBubble: IFieldResolver = (_source, arg, { dal: { bubble: { insertOne } } }) => {
    const bubble = arg as IBubble
    insertOne(bubble)
    return bubble;
  }

  const addAttribute: IFieldResolver = (_source, arg, { dal: { attribute: { insertOne } } }) => {
    const attribute = arg as IAttribute
    insertOne(attribute)
    attributes.push(attribute)
    return attribute;
  }

  const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      addBubble: {
        type: bubbleType,
        args: addBubbleFields,
        resolve: addBubble,
      },
      addAttribute: {
        type: attributeType,
        args: addAttributeFields,
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