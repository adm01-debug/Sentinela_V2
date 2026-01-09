import { describe, it, expect, vi } from 'vitest';
import { handler } from '../auth-logout';

describe('auth-logout edge function', () => {
  it('should clear auth cookie', async () => {
    const req = new Request('http://localhost/auth-logout', { method: 'POST' });
    const res = await handler(req);
    expect(res.headers.get('set-cookie')).toContain('Max-Age=0');
  });

  it('should return 200', async () => {
    const req = new Request('http://localhost/auth-logout', { method: 'POST' });
    const res = await handler(req);
    expect(res.status).toBe(200);
  });
});