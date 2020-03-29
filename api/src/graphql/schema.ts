import {
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLFieldResolver,
  GraphQLEnumType,
} from 'graphql';

interface IBubble {
  text: string
}

export interface IAttribute {
  name: string
  kind: 'Boolean' | 'Enum' | 'Integer'
  options?: string[]
}

const createSchema = (attributes: IAttribute[]) => {
  const bubbles: IBubble[] = []

  const bubbleTypeFields = {
    text: {
      type: GraphQLNonNull(GraphQLString),
    },
  }
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

  const addAttribute: GraphQLFieldResolver<any, any> = (_source, arg) => {
    const attribute = arg as IAttribute
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