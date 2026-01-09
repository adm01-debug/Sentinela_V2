import { describe, it, expect } from 'vitest';
import { handler } from '../employees-create';

describe('employees-create edge function', () => {
  it('should return 400 for missing fields', async () => {
    const req = new Request('http://localhost/employees', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid_token' },
      body: JSON.stringify({ name: 'John' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(400);
  });

  it('should return 201 for valid employee', async () => {
    const req = new Request('http://localhost/employees', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid_token' },
      body: JSON.stringify({ name: 'John Doe', email: 'john@company.com', department: 'Engineering' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(201);
  });

  it('should return 409 for duplicate email', async () => {
    const req = new Request('http://localhost/employees', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid_token' },
      body: JSON.stringify({ name: 'Jane', email: 'existing@company.com', department: 'HR' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(409);
  });
});