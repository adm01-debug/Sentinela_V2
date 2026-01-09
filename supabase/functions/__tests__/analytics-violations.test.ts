import { describe, it, expect } from 'vitest';
import { handler } from '../analytics-violations';

describe('analytics-violations edge function', () => {
  it('should return violation analytics', async () => {
    const req = new Request('http://localhost/analytics/violations', {
      headers: { Authorization: 'Bearer valid_token' },
    });
    const res = await handler(req);
    const data = await res.json();
    expect(data.bySeverity).toBeDefined();
    expect(data.byType).toBeDefined();
    expect(data.timeline).toBeDefined();
  });
});