import { describe, it, expect } from 'vitest';
import { handler } from '../violations-list';

describe('violations-list edge function', () => {
  it('should return paginated violations', async () => {
    const req = new Request('http://localhost/violations?page=1&limit=20', {
      headers: { Authorization: 'Bearer valid_token' },
    });
    const res = await handler(req);
    const data = await res.json();
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('should filter by severity', async () => {
    const req = new Request('http://localhost/violations?severity=high', {
      headers: { Authorization: 'Bearer valid_token' },
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
  });

  it('should filter by date range', async () => {
    const req = new Request('http://localhost/violations?startDate=2024-01-01&endDate=2024-01-31', {
      headers: { Authorization: 'Bearer valid_token' },
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
  });

  it('should filter by employee', async () => {
    const req = new Request('http://localhost/violations?employeeId=1', {
      headers: { Authorization: 'Bearer valid_token' },
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
  });
});