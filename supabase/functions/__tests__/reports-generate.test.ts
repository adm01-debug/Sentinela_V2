import { describe, it, expect } from 'vitest';
import { handler } from '../reports-generate';

describe('reports-generate edge function', () => {
  it('should return 400 for missing report type', async () => {
    const req = new Request('http://localhost/reports/generate', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid_token' },
      body: JSON.stringify({}),
    });
    const res = await handler(req);
    expect(res.status).toBe(400);
  });

  it('should return 200 for valid report request', async () => {
    const req = new Request('http://localhost/reports/generate', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid_token' },
      body: JSON.stringify({ type: 'violations', startDate: '2024-01-01', endDate: '2024-01-31' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.reportId).toBeDefined();
  });

  it('should support different report formats', async () => {
    const req = new Request('http://localhost/reports/generate', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid_token' },
      body: JSON.stringify({ type: 'productivity', format: 'pdf' }),
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
  });
});