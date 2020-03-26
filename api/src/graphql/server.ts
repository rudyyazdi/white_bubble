import { ApolloServer, gql } from 'apollo-server-express';

const typeDefs = gql`
  type Bubble {
    title: String
  }
  type Query {
    bubbles: [Bubble]
  }
  type Mutation {
    addBubble(title: String): Bubble
  }
`;

interface Bubble {
  title: string
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