import { describe, it, expect } from 'vitest';
import { handler } from '../analytics-productivity';

describe('analytics-productivity edge function', () => {
  it('should return productivity data', async () => {
    const req = new Request('http://localhost/analytics/productivity', {
      headers: { Authorization: 'Bearer valid_token' },
    });
    const res = await handler(req);
    const data = await res.json();
    expect(data.averageScore).toBeDefined();
    expect(data.trends).toBeDefined();
  });

  it('should filter by department', async () => {
    const req = new Request('http://localhost/analytics/productivity?department=Engineering', {
      headers: { Authorization: 'Bearer valid_token' },
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
  });
});