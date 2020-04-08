import Dal from 'src/domain/bubble/Dal';
import { MongoClient, Db, Collection } from 'mongodb';

describe('Dal', () => {
  let client: MongoClient
  let db: Db
  let collection: Collection

  beforeEach((done: () => void) => {
    const url = 'mongodb://localhost:27017';
    const dbName = 'myproject';

    client = new MongoClient(url);
    client.connect((err) => {
      db = client.db(dbName);
      collection = db.collection('bubble')
      collection.deleteMany({}, () => {
        done()
      })
    });
  })

  afterEach((done: () => void) => {
    client.close();
    done()
  })

  describe('search', () => {
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

    it('uses in with ID', async (done: () => void) => {
      const dal = Dal(db)
      await dal.insertOne({ text: 'sometext', id: '507f191e810c19729de860ea' })
      await dal.insertOne({ text: 'sometext', id: '507f1f77bcf86cd799439011' })
      await dal.insertOne({ text: 'sometext', id: '5e8d7ce72129be5137ca2fa2' })
      await dal.insertOne({ text: 'sometext', id: '5e8d7cf82129be5137ca2fa3' })

      const onlyText = await dal.search({ idIn: ['507f191e810c19729de860ea', '507f1f77bcf86cd799439011'] })
      expect(onlyText.length).toBe(2)
      done()
    });

    it('uses equal with ID', async (done: () => void) => {
      const dal = Dal(db)
      await dal.insertOne({ text: 'sometext', id: '507f191e810c19729de860ea' })
      await dal.insertOne({ text: 'sometext', id: '507f1f77bcf86cd799439011' })
      await dal.insertOne({ text: 'sometext', id: '5e8d7ce72129be5137ca2fa2' })
      await dal.insertOne({ text: 'sometext', id: '5e8d7cf82129be5137ca2fa3' })

      const onlyText = await dal.search({ idEq: '507f191e810c19729de860ea' })

      expect(onlyText.length).toBe(1)
      done()
    });
  });

  describe('update', () => {
    it('updates when the args are present', async (done: () => void) => {
      const dal = Dal(db)
      await dal.insertOne({ text: 'sometext1', id: '507f191e810c19729de860ea', stuff: 'thing' })
      await dal.insertOne({ text: 'sometext2', id: '507f1f77bcf86cd799439011', stuff: 'other' })
      await dal.insertOne({ text: 'sometext3', id: '5e8d7ce72129be5137ca2fa2', stuff: 'thing' })
      await dal.insertOne({ text: 'sometext4', id: '5e8da5e82129be5137ca2fa4' })
      await dal.insertOne({ text: 'sometext5', id: '5e8d7cf82129be5137ca2fa3' })

      await dal.update(['507f191e810c19729de860ea', '507f1f77bcf86cd799439011', '5e8da5e82129be5137ca2fa4'], { stuff: 'new' })

      const all = await collection.find({}).sort({ text: 1 }).toArray()

      const result = all.map(({ text, stuff }) => ({ text, stuff }))

      expect(result).toEqual([{
        text: 'sometext1',
        stuff: 'new'
      },
      {
        text: 'sometext2',
        stuff: 'new'
      },
      {
        text: 'sometext3',
        stuff: 'thing'
      },
      {
        text: 'sometext4',
        stuff: 'new'
      },
      { text: 'sometext5', stuff: undefined }])
      done()
    });
  })
})

