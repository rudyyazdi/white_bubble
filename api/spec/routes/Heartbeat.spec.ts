import request from 'supertest';
import Server from '@server';

describe('heartbeat', () => {
  it('should return 200 response code', done => {
    request(Server)
      .get('/heartbeat')
      .expect(200, '<3', done);
  });
});
