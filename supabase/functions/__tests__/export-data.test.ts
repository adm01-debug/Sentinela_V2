import { describe, it, expect } from 'vitest';
import { handler } from '../export-data';

describe('export-data edge function', () => {
  it('should export as CSV', async () => {
    const req = new Request('http://localhost/export?type=employees&format=csv', {
      headers: { Authorization: 'Bearer valid_token' },
    });
    const res = await handler(req);
    expect(res.headers.get('content-type')).toContain('text/csv');
  });

  it('should export as Excel', async () => {
    const req = new Request('http://localhost/export?type=violations&format=xlsx', {
      headers: { Authorization: 'Bearer valid_token' },
    });
    const res = await handler(req);
    expect(res.headers.get('content-type')).toContain('spreadsheet');
  });

  it('should return 400 for invalid type', async () => {
    const req = new Request('http://localhost/export?type=invalid', {
      headers: { Authorization: 'Bearer valid_token' },
    });
    const res = await handler(req);
    expect(res.status).toBe(400);
  });
});