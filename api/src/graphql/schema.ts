import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLFieldResolver,
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

  const addBubble: GraphQLFieldResolver<any, any> = (_source, arg) => {
    const bubble = arg as IBubble
    bubbles.push(bubble)
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