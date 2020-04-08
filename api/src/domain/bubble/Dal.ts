import { Db, ObjectID, Collection, ObjectId } from 'mongodb';
import { IBubble } from 'src/graphql/schema';

const DeepAssign = (main: { [key: string]: any }, target: { [key: string]: any }) => {
  Object.keys(target).forEach((key) => {
    if (main[key]) {
      main[key] = { ...main[key], ...target[key] }
    } else {
      main = { ...main, ...target }
    }
  })
  return main
}

export interface IBubbleDal {
  collection: Collection
  insertOne: (attr: IBubble) => Promise<void>
  update: (ids: string[], attr: { [key: string]: any }) => Promise<void>
  search: (args: { [key: string]: any }) => Promise<IBubble[]>
}

const Dal: (db: Db) => IBubbleDal = (db) => {
  const collection = db.collection('bubble');

  const transformId = (bubble: IBubble) => {
    if (bubble._id) bubble.id = bubble._id.toString()
    return bubble
  }

  const transformObjectId = (v: string) => new ObjectId(v)

  const makeQuery = (field: string, pred: string, value: any): {} => {
    if (field === 'id' && pred === 'Eq') return ({ _id: new ObjectId(value) })
    if (field === 'id' && pred === 'In') return ({ _id: { $in: value.map(transformObjectId) } })
    if (pred === 'Matches') return { [field]: { '$regex': value, '$options': 'i' } }
    if (pred === 'Eq') return { [field]: { $eq: value } }
    if (pred === 'Gt') return { [field]: { $gt: value } }
    if (pred === 'Gte') return { [field]: { $gte: value } }
    if (pred === 'Lt') return { [field]: { $lt: value } }
    if (pred === 'Lte') return { [field]: { $lte: value } }
    if (pred === 'In') return { [field]: { $in: value } }
    return {}
  }

  const search = async (args: { [key: string]: any }) => {
    let find = {}
    const keys = Object.keys(args)

    keys.forEach((key: string) => {
      const [field, pred] = key.split(/(?=Eq|Matches|Gt|Lt|In)/)
      find = DeepAssign(find, makeQuery(field, pred, args[key]))
    })

    const arr = await collection.find(find).toArray()

    return arr.map(transformId)
  }

  const insertOne = async (attr: IBubble): Promise<void> => {
    if (attr.id) { attr._id = new ObjectID(attr.id) }
    await collection.insertOne(attr)
  }

  const update = async (ids: string[], attr: { [key: string]: any }): Promise<void> => {
    await collection.updateMany({ _id: { $in: ids.map(transformObjectId) } }, { $set: attr })
  }

  return {
    collection,
    insertOne,
    search,
    update
  }
}

export default Dal;