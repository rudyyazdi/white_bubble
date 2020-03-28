import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLFieldResolver
} from 'graphql';

interface IBubble {
  text: string
}


const createSchema = () => {
  const bubbles: IBubble[] = []

  const bubbleType = new GraphQLObjectType({
    name: 'Bubble',
    fields: () => ({
      text: {
        type: GraphQLString,
      },
    })
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
    },
  })

  const addBubble: GraphQLFieldResolver<undefined, any> = (a, bubble, c, e) => {
    bubbles.push({ text: bubble.text })
    return bubble;
  }

  const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      addBubble: {
        type: bubbleType,
        args: { text: { type: GraphQLString } },
        resolve: addBubble,
      },
    },
  })

  return new GraphQLSchema({
    query: queryType,
    mutation: mutationType,
    types: [bubbleType]
  })
}

export default createSchema