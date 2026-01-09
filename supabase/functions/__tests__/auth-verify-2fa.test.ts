import { describe, it, expect } from 'vitest';
import { handler } from '../auth-verify-2fa';

describe('auth-verify-2fa edge function', () => {
  it('should return 400 for missing code', async () => {
    const req = new Request('http://localhost/auth-verify-2fa', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await handler(req);
    expect(res.status).toBe(400);
  });

  it('should return 401 for invalid code', async () => {
    const req = new Request('http://localhost/auth-verify-2fa', {
      method: 'POST',
      body: JSON.stringify({ code: '000000' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(401);
  });

  it('should return 200 for valid code', async () => {
    const req = new Request('http://localhost/auth-verify-2fa', {
      method: 'POST',
      body: JSON.stringify({ code: '123456' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
  });
});