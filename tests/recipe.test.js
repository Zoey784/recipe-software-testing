const request = require('supertest');
const app = require('../app');

describe('GET /recipe/1', () => {
  test('returns 200 and contains "Pasta Carbonara"', async () => {
    const res = await request(app).get('/recipe/1');
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Pasta Carbonara');
  });
});
