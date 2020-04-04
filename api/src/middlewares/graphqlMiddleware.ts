import graphqlHTTP from 'express-graphql';
import createSchema, { IAttribute } from 'src/graphql/schema';
import { IncomingMessage, ServerResponse } from 'http';
import { Db } from 'mongodb';

import AttributeDal from 'src/domain/attribute/Dal'

const GraphqlMiddleware = async (db: Db) => {
  const attributeDal = AttributeDal(db)

  const attributes: IAttribute[] = await attributeDal.getAll()

  return (req: IncomingMessage, res: ServerResponse) => {
    const schema = createSchema(attributes)

    const dal = {
      attribute: attributeDal
    }

    return graphqlHTTP({
      schema,
      context: { db, dal }
    })(req, res)
  }
}

export default GraphqlMiddleware;