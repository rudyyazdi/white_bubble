import Dal from 'src/domain/attribute/Dal';
import { MongoClient, Db } from 'mongodb'

describe('getAll', () => {
  let client: MongoClient
  let db: Db

  beforeEach((done: () => void) => {
    const url = 'mongodb://localhost:27017';
    const dbName = 'myproject';

    client = new MongoClient(url);
    client.connect((err) => {
      db = client.db(dbName);
      db.collection('attribute').deleteMany({}, () => {
        done()
      })
    });
  })

  afterEach((done: () => void) => {
    client.close();
    done()
  })

  it('returns an empty array when nothing in the db', async (done: () => void) => {
    const dal = Dal(db)
    const all = await dal.getAll()
    expect(all).toEqual([])
    done()
  });

  it('returns all the attributes', async (done: () => void) => {
    const dal = Dal(db)
    await dal.insertOne({ name: 'myname', kind: 'Boolean' })
    const all = await dal.getAll()
    expect(all.length).toBe(1)
    done()
  });
});