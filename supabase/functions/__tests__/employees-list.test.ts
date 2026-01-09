import { describe, it, expect } from 'vitest';
import { handler } from '../employees-list';

describe('employees-list edge function', () => {
  it('should return 401 without auth', async () => {
    const req = new Request('http://localhost/employees');
    const res = await handler(req);
    expect(res.status).toBe(401);
  });

  it('should return paginated employees', async () => {
    const req = new Request('http://localhost/employees?page=1&limit=10', {
      headers: { Authorization: 'Bearer valid_token' },
    });
    const res = await handler(req);
    const data = await res.json();
    expect(data.data).toBeDefined();
    expect(data.pagination).toBeDefined();
  });

  it('should filter by department', async () => {
    const req = new Request('http://localhost/employees?department=Engineering', {
      headers: { Authorization: 'Bearer valid_token' },
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
  });

  it('should search by name', async () => {
    const req = new Request('http://localhost/employees?search=John', {
      headers: { Authorization: 'Bearer valid_token' },
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
  });
});