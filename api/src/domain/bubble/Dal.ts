import { Db } from 'mongodb';
import { IBubble } from 'src/graphql/schema';
import { Collection } from 'mongodb'

export interface IBubbleDal {
  collection: Collection
  insertOne: (attr: IBubble) => Promise<void>
  search: (args: { [key: string]: any }) => Promise<IBubble[]>
}

const Dal: (db: Db) => IBubbleDal = (db) => {
  const collection = db.collection('bubble');

  const makeQuery = (field: string, pred: string, value: any): {} => {
    switch (pred) {
      case 'Matches':
        return { [field]: { '$regex': value, '$options': 'i' } }
      case 'Eq':
        return { [field]: value }
      case 'Gt':
        return { [field]: { $gt: value } }
      case 'Gte':
        return { [field]: { $gte: value } }
      case 'Lt':
        return { [field]: { $lt: value } }
      case 'Lte':
        return { [field]: { $lte: value } }
      case 'In':
        return { [field]: { $in: value } }
      default:
        return {}
    }
  }

  const search = async (args: { [key: string]: any }) => {
    let find = {}
    const keys = Object.keys(args)

    keys.forEach((key: string) => {
      const [field, pred] = key.split(/(?=Eq|Matches|Gt|Lt|In)/)
      find = { ...find, ...makeQuery(field, pred, args[key]) }
    })

    return await collection.find(find).toArray()
  }

  const insertOne = async (attr: IBubble): Promise<void> => {
    await collection.insertOne(attr)
  }

  return {
    collection,
    insertOne,
    search
  }
}

export default Dal;