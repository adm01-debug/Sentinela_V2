import { describe, it, expect } from 'vitest';
import { handler } from '../employees-delete';

describe('employees-delete edge function', () => {
  it('should return 404 for non-existent employee', async () => {
    const req = new Request('http://localhost/employees/999', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer valid_token' },
    });
    const res = await handler(req);
    expect(res.status).toBe(404);
  });

  it('should return 204 for successful deletion', async () => {
    const req = new Request('http://localhost/employees/1', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer valid_token' },
    });
    const res = await handler(req);
    expect(res.status).toBe(204);
  });
});