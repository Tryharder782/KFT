const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const guestGuard = require('../middlewares/guestGuard');

const app = express();
app.use(express.json());
app.post('/protected', guestGuard, (req, res) => res.json({ ok: true }));

describe('guestGuard middleware', () => {
  const secret = 'testsecret';
  beforeAll(() => {
    process.env.SECRET_KEY = secret;
  });

  it('rejects guest user', async () => {
    const token = jwt.sign({ role: 'GUEST' }, secret);
    const res = await request(app)
      .post('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(403);
  });

  it('allows normal user', async () => {
    const token = jwt.sign({ role: 'USER' }, secret);
    const res = await request(app)
      .post('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});
