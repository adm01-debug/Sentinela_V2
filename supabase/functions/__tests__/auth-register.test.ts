import { describe, it, expect, vi } from 'vitest';
import { handler } from '../auth-register';

describe('auth-register edge function', () => {
  it('should return 400 for missing fields', async () => {
    const req = new Request('http://localhost/auth-register', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(400);
  });

  it('should return 409 for existing email', async () => {
    const req = new Request('http://localhost/auth-register', {
      method: 'POST',
      body: JSON.stringify({ email: 'existing@test.com', password: 'Test123!', name: 'Test' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(409);
  });

  it('should return 201 for successful registration', async () => {
    const req = new Request('http://localhost/auth-register', {
      method: 'POST',
      body: JSON.stringify({ email: 'new@test.com', password: 'Test123!', name: 'New User' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(201);
  });

  it('should validate password strength', async () => {
    const req = new Request('http://localhost/auth-register', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: '123', name: 'Test' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(400);
  });
});