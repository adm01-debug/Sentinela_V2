import { describe, it, expect } from 'vitest';
import { handler } from '../import-data';

describe('import-data edge function', () => {
  it('should return 400 for missing file', async () => {
    const req = new Request('http://localhost/import', {
      method: 'POST',
      headers: { Authorization: 'Bearer admin_token' },
    });
    const res = await handler(req);
    expect(res.status).toBe(400);
  });

  it('should validate file format', async () => {
    const formData = new FormData();
    formData.append('file', new Blob(['invalid'], { type: 'text/plain' }), 'data.txt');
    const req = new Request('http://localhost/import?type=employees', {
      method: 'POST',
      headers: { Authorization: 'Bearer admin_token' },
      body: formData,
    });
    const res = await handler(req);
    expect(res.status).toBe(400);
  });

  it('should return import preview', async () => {
    const formData = new FormData();
    formData.append('file', new Blob(['name,email\nJohn,john@test.com'], { type: 'text/csv' }), 'data.csv');
    const req = new Request('http://localhost/import?type=employees&preview=true', {
      method: 'POST',
      headers: { Authorization: 'Bearer admin_token' },
      body: formData,
    });
    const res = await handler(req);
    const data = await res.json();
    expect(data.preview).toBeDefined();
  });
});