import { Db } from 'mongodb';
import { IAttribute } from 'src/graphql/schema';

const COL = 'attribute'

export interface IAttributeDal {
  getAll: () => Promise<IAttribute[]>
  insertOne: (attr: IAttribute) => Promise<void>
}

const Dal = (db: Db) => {
  const collection = db.collection('attribute');
  const getAll = async () => {
    return await collection.find({}).toArray()
  }
  const insertOne = async (attr: IAttribute): Promise<void> => {
    await collection.insertOne(attr)
  }

  return {
    getAll,
    insertOne
  }
}

export default Dal;