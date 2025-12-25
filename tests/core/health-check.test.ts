import { HealthCheck } from '../../core/health-check';
describe('HealthCheck', () => {
  it('should return healthy status', async () => {
    const check = new HealthCheck('db', async () => ({ status: 'healthy' }));
    const result = await check.run();
    expect(result.status).toBe('healthy');
    expect(result.latency).toBeDefined();
  });
  it('should handle timeout', async () => {
    const check = new HealthCheck('slow', async () => new Promise(r => setTimeout(r, 10000)), { timeout: 100 });
    const result = await check.run();
    expect(result.status).toBe('unhealthy');
  });
});
