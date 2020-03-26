import { ApolloServer, gql } from 'apollo-server-express';

const typeDefs = gql`
  type Bubble {
    text: String
  }
  type Query {
    bubbles: [Bubble]
  }
  type Mutation {
    addBubble(text: String): Bubble
  }
`;

interface Bubble {
  text: string
}

const bubbles: Bubble[] = []

const resolvers = {
  Query: {
    bubbles: () => bubbles,
  },
  Mutation: {
    addBubble: (root: any, args: Bubble, context: any) => {
      bubbles.push(args)
      console.log(root, args, context);

      return args
    }
  }
};

export default new ApolloServer({ typeDefs, resolvers });