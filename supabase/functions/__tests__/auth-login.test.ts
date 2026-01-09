import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from '../auth-login';

describe('auth-login edge function', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should return 400 for missing credentials', async () => {
    const req = new Request('http://localhost/auth-login', { method: 'POST', body: JSON.stringify({}) });
    const res = await handler(req);
    expect(res.status).toBe(400);
  });

  it('should return 401 for invalid credentials', async () => {
    const req = new Request('http://localhost/auth-login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: 'wrong' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(401);
  });

  it('should return 200 with token for valid credentials', async () => {
    const req = new Request('http://localhost/auth-login', {
      method: 'POST',
      body: JSON.stringify({ email: 'valid@test.com', password: 'correct' }),
    });
    const res = await handler(req);
    const data = await res.json();
    expect(data.token).toBeDefined();
  });

  it('should set secure cookie', async () => {
    const req = new Request('http://localhost/auth-login', {
      method: 'POST',
      body: JSON.stringify({ email: 'valid@test.com', password: 'correct' }),
    });
    const res = await handler(req);
    expect(res.headers.get('set-cookie')).toContain('HttpOnly');
  });
});