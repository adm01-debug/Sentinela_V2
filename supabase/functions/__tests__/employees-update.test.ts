import { describe, it, expect } from 'vitest';
import { handler } from '../employees-update';

describe('employees-update edge function', () => {
  it('should return 404 for non-existent employee', async () => {
    const req = new Request('http://localhost/employees/999', {
      method: 'PUT',
      headers: { Authorization: 'Bearer valid_token' },
      body: JSON.stringify({ name: 'Updated' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(404);
  });

  it('should return 200 for successful update', async () => {
    const req = new Request('http://localhost/employees/1', {
      method: 'PUT',
      headers: { Authorization: 'Bearer valid_token' },
      body: JSON.stringify({ name: 'Updated Name' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
  });
});