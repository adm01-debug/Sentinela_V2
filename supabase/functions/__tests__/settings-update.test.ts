import { describe, it, expect } from 'vitest';
import { handler } from '../settings-update';

describe('settings-update edge function', () => {
  it('should return 403 for non-admin', async () => {
    const req = new Request('http://localhost/settings', {
      method: 'PUT',
      headers: { Authorization: 'Bearer user_token' },
      body: JSON.stringify({ companyName: 'New Name' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(403);
  });

  it('should return 200 for admin update', async () => {
    const req = new Request('http://localhost/settings', {
      method: 'PUT',
      headers: { Authorization: 'Bearer admin_token' },
      body: JSON.stringify({ companyName: 'Updated Company' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
  });
});