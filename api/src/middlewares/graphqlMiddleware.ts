import graphqlHTTP from 'express-graphql';
import createSchema, { IAttribute } from 'src/graphql/schema';
import { IncomingMessage, ServerResponse } from 'http';


const graphqlMiddleware = () => {
  const attributes: IAttribute[] = []

  return (req: IncomingMessage, res: ServerResponse) => {
    const schema = createSchema(attributes)

    return graphqlHTTP({
      schema,
      context: { hello: 'world' }
    })(req, res)
  }
}


export default graphqlMiddleware;