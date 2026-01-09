import { describe, it, expect } from 'vitest';
import { handler } from '../auth-refresh';

describe('auth-refresh edge function', () => {
  it('should return 401 without refresh token', async () => {
    const req = new Request('http://localhost/auth-refresh', { method: 'POST' });
    const res = await handler(req);
    expect(res.status).toBe(401);
  });

  it('should return new access token with valid refresh token', async () => {
    const req = new Request('http://localhost/auth-refresh', {
      method: 'POST',
      headers: { Cookie: 'refresh_token=valid_token' },
    });
    const res = await handler(req);
    const data = await res.json();
    expect(data.accessToken).toBeDefined();
  });
});