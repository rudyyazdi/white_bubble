import request from 'supertest';
import Server from '@server';
import { MongoClient, Db } from 'mongodb'

describe('heartbeat', () => {
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

  it('should return 200 response code', async (done: () => void) => {
    const server = await Server(db)
    request(server)
      .get('/heartbeat')
      .expect(200, '<3', done);
  });
});
