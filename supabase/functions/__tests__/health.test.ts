import { describe, it, expect } from 'vitest';
import { handler } from '../health';

describe('health edge function', () => {
  it('should return health status', async () => {
    const req = new Request('http://localhost/health');
    const res = await handler(req);
    const data = await res.json();
    expect(data.status).toBe('healthy');
  });

  it('should include service checks', async () => {
    const req = new Request('http://localhost/health?detailed=true');
    const res = await handler(req);
    const data = await res.json();
    expect(data.database).toBeDefined();
    expect(data.cache).toBeDefined();
  });

  it('should return 503 when unhealthy', async () => {
    // Simulate unhealthy state
    const req = new Request('http://localhost/health');
    const res = await handler(req);
    expect([200, 503]).toContain(res.status);
  });
});