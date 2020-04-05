import Dal from 'src/domain/bubble/Dal';
import { MongoClient, Db } from 'mongodb'

describe('search', () => {
  let client: MongoClient
  let db: Db

  beforeEach((done: () => void) => {
    const url = 'mongodb://localhost:27017';
    const dbName = 'myproject';

    client = new MongoClient(url);
    client.connect((err) => {
      db = client.db(dbName);
      db.collection('bubble').deleteMany({}, () => {
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
    const all = await dal.search({ a: 3 })
    expect(all).toEqual([])
    done()
  });

  it('uses textMatches', async (done: () => void) => {
    const dal = Dal(db)
    await dal.insertOne({ text: 'long ass text' })
    await dal.insertOne({ text: 'the other text' })
    await dal.insertOne({ text: 'a beautiful fish in the sea' })
    const all = await dal.search({})
    expect(all.length).toBe(3)

    const onlyText = await dal.search({ textMatches: 'text' })
    expect(onlyText.length).toBe(2)
    done()
  });

  it('uses case insensitive textMatches', async (done: () => void) => {
    const dal = Dal(db)
    await dal.insertOne({ text: 'long ass text' })
    await dal.insertOne({ text: 'the other Text' })
    await dal.insertOne({ text: 'a beautiful fish in the sea' })
    const all = await dal.search({})
    expect(all.length).toBe(3)

    const onlyText = await dal.search({ textMatches: 'text' })
    expect(onlyText.length).toBe(2)
    done()
  });

  it('uses equal', async (done: () => void) => {
    const dal = Dal(db)
    await dal.insertOne({ text: 'sometext' })
    await dal.insertOne({ text: 'sometext' })
    await dal.insertOne({ text: 'other sometext' })
    await dal.insertOne({ text: 'a beautiful fish in the sea' })
    const all = await dal.search({})
    expect(all.length).toBe(4)

    const onlyText = await dal.search({ textEq: 'sometext' })
    expect(onlyText.length).toBe(2)
    done()
  });
});