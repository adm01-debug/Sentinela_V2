import { describe, it, expect } from 'vitest';
import { handler } from '../analytics-dashboard';

describe('analytics-dashboard edge function', () => {
  it('should return dashboard metrics', async () => {
    const req = new Request('http://localhost/analytics/dashboard', {
      headers: { Authorization: 'Bearer valid_token' },
    });
    const res = await handler(req);
    const data = await res.json();
    expect(data.totalEmployees).toBeDefined();
    expect(data.totalViolations).toBeDefined();
    expect(data.productivityScore).toBeDefined();
  });

  it('should support date range filter', async () => {
    const req = new Request('http://localhost/analytics/dashboard?period=week', {
      headers: { Authorization: 'Bearer valid_token' },
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
  });
});