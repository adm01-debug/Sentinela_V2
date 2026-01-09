import { describe, it, expect } from 'vitest';
import { handler } from '../violations-update';

describe('violations-update edge function', () => {
  it('should return 404 for non-existent violation', async () => {
    const req = new Request('http://localhost/violations/999', {
      method: 'PUT',
      headers: { Authorization: 'Bearer valid_token' },
      body: JSON.stringify({ status: 'resolved' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(404);
  });

  it('should return 200 for successful update', async () => {
    const req = new Request('http://localhost/violations/1', {
      method: 'PUT',
      headers: { Authorization: 'Bearer valid_token' },
      body: JSON.stringify({ status: 'resolved', resolution: 'Warning issued' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
  });
});