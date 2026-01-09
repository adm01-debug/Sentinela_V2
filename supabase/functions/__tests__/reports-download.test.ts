import { describe, it, expect } from 'vitest';
import { handler } from '../reports-download';

describe('reports-download edge function', () => {
  it('should return 404 for non-existent report', async () => {
    const req = new Request('http://localhost/reports/download/999', {
      headers: { Authorization: 'Bearer valid_token' },
    });
    const res = await handler(req);
    expect(res.status).toBe(404);
  });

  it('should return file for valid report', async () => {
    const req = new Request('http://localhost/reports/download/1', {
      headers: { Authorization: 'Bearer valid_token' },
    });
    const res = await handler(req);
    expect(res.headers.get('content-type')).toContain('application/');
  });
});