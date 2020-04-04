import { Db } from 'mongodb';
import { IBubble } from 'src/graphql/schema';
import { Collection } from 'mongodb'

export interface IBubbleDal {
  collection: Collection
  insertOne: (attr: IBubble) => Promise<void>
}

const Dal = (db: Db) => {
  const collection = db.collection('bubble');

  const insertOne = async (attr: IBubble): Promise<void> => {
    await collection.insertOne(attr)
  }

  return {
    collection,
    insertOne
  }
}

export default Dal;