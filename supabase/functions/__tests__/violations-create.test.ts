import { describe, it, expect } from 'vitest';
import { handler } from '../violations-create';

describe('violations-create edge function', () => {
  it('should return 400 for missing fields', async () => {
    const req = new Request('http://localhost/violations', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid_token' },
      body: JSON.stringify({}),
    });
    const res = await handler(req);
    expect(res.status).toBe(400);
  });

  it('should return 201 for valid violation', async () => {
    const req = new Request('http://localhost/violations', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid_token' },
      body: JSON.stringify({ employeeId: 1, type: 'policy', severity: 'medium', description: 'Test violation' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(201);
  });
});