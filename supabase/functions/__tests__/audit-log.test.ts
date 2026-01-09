import { describe, it, expect } from 'vitest';
import { handler } from '../audit-log';

describe('audit-log edge function', () => {
  it('should return audit logs', async () => {
    const req = new Request('http://localhost/audit-log', {
      headers: { Authorization: 'Bearer admin_token' },
    });
    const res = await handler(req);
    const data = await res.json();
    expect(Array.isArray(data.logs)).toBe(true);
  });

  it('should filter by action', async () => {
    const req = new Request('http://localhost/audit-log?action=login', {
      headers: { Authorization: 'Bearer admin_token' },
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
  });

  it('should filter by user', async () => {
    const req = new Request('http://localhost/audit-log?userId=1', {
      headers: { Authorization: 'Bearer admin_token' },
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
  });
});