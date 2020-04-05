import Dal from 'src/domain/bubble/Dal';
import { MongoClient, Db } from 'mongodb';

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

  it('uses grater than', async (done: () => void) => {
    const dal = Dal(db)
    await dal.insertOne({ text: 'sometext', number: 1 })
    await dal.insertOne({ text: 'sometext', number: 2 })
    await dal.insertOne({ text: 'sometext', number: 3 })
    await dal.insertOne({ text: 'sometext', number: 4 })
    const all = await dal.search({})
    expect(all.length).toBe(4)

    const onlyText = await dal.search({ numberGt: 2 })
    expect(onlyText.length).toBe(2)
    done()
  });

  it('uses grater than equal', async (done: () => void) => {
    const dal = Dal(db)
    await dal.insertOne({ text: 'sometext', number: 1 })
    await dal.insertOne({ text: 'sometext', number: 2 })
    await dal.insertOne({ text: 'sometext', number: 3 })
    await dal.insertOne({ text: 'sometext', number: 4 })
    const all = await dal.search({})
    expect(all.length).toBe(4)

    const onlyText = await dal.search({ numberGte: 2 })
    expect(onlyText.length).toBe(3)
    done()
  });

  it('uses less than', async (done: () => void) => {
    const dal = Dal(db)
    await dal.insertOne({ text: 'sometext', number: 1 })
    await dal.insertOne({ text: 'sometext', number: 2 })
    await dal.insertOne({ text: 'sometext', number: 3 })
    await dal.insertOne({ text: 'sometext', number: 4 })
    const all = await dal.search({})
    expect(all.length).toBe(4)

    const onlyText = await dal.search({ numberLt: 3 })
    expect(onlyText.length).toBe(2)
    done()
  });

  it('uses less than equal', async (done: () => void) => {
    const dal = Dal(db)
    await dal.insertOne({ text: 'sometext', number: 1 })
    await dal.insertOne({ text: 'sometext', number: 2 })
    await dal.insertOne({ text: 'sometext', number: 3 })
    await dal.insertOne({ text: 'sometext', number: 4 })
    const all = await dal.search({})
    expect(all.length).toBe(4)

    const onlyText = await dal.search({ numberLte: 3 })
    expect(onlyText.length).toBe(3)
    done()
  });

  it('uses less than and greater than', async (done: () => void) => {
    const dal = Dal(db)
    await dal.insertOne({ text: 'sometext', number: 1 })
    await dal.insertOne({ text: 'sometext', number: 2 })
    await dal.insertOne({ text: 'sometext', number: 3 })
    await dal.insertOne({ text: 'sometext', number: 4 })
    const all = await dal.search({})
    expect(all.length).toBe(4)

    const onlyText = await dal.search({ numberLt: 4, numberGt: 1 })
    expect(onlyText.length).toBe(2)
    done()
  });

  it('uses in', async (done: () => void) => {
    const dal = Dal(db)
    await dal.insertOne({ text: 'sometext', number: 1 })
    await dal.insertOne({ text: 'sometext', number: 2 })
    await dal.insertOne({ text: 'sometext', number: 3 })
    await dal.insertOne({ text: 'sometext', number: 4 })
    const all = await dal.search({})
    expect(all.length).toBe(4)

    const onlyText = await dal.search({ numberIn: [1, 2] })
    expect(onlyText.length).toBe(2)
    done()
  });
});