const request = require('supertest');
const app = require('../server'); // Импортируем наш Express app

// Jest будет ждать завершения асинхронных операций, поэтому нам не нужно вручную закрывать сервер
// Но если бы тесты "зависали", потребовалось бы добавить afterAll(done => { server.close(done); })
// В данном случае, так как server.js запускает сервер, нам нужно найти способ предотвратить это в тестовой среде.
// Пока что оставим так, Jest должен справиться.

describe('API Test Endpoint', () => {
  it('GET /api/test должен вернуть статус 200 и сообщение об успехе', async () => {
    const response = await request(app).get('/api/test');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'API роуты работают!');
  });
});