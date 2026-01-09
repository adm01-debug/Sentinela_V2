import { describe, it, expect } from 'vitest';
import { handler } from '../settings-get';

describe('settings-get edge function', () => {
  it('should return organization settings', async () => {
    const req = new Request('http://localhost/settings', {
      headers: { Authorization: 'Bearer valid_token' },
    });
    const res = await handler(req);
    const data = await res.json();
    expect(data.companyName).toBeDefined();
    expect(data.timezone).toBeDefined();
  });
});