const request = require('supertest');
const app = require('../../app');

describe('Integration Test - GET /recipe/:id', () => {

  test('should return 200 and correct recipe structure', async () => {

    // Act
    const response = await request(app).get('/recipe/1');

    // Assert Status Code
    expect(response.status).toBe(200);

    // Assert Response Body Structure
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('title');
    expect(response.body).toHaveProperty('description');
    expect(response.body).toHaveProperty('ingredients');
    expect(Array.isArray(response.body.ingredients)).toBe(true);

  });

});
