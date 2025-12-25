import { HealthChecker } from '../../healthChecksAdvanced';

describe('HealthChecker', () => {
  let checker: HealthChecker;
  beforeEach(() => { checker = new HealthChecker(); });

  it('should register and run checks', async () => {
    checker.register('database', async () => ({ status: 'healthy', latency: 5 }));
    checker.register('redis', async () => ({ status: 'healthy', latency: 2 }));
    const results = await checker.runAll();
    expect(results.database.status).toBe('healthy');
    expect(results.redis.status).toBe('healthy');
  });

  it('should report unhealthy status', async () => {
    checker.register('failing', async () => { throw new Error('Connection failed'); });
    const results = await checker.runAll();
    expect(results.failing.status).toBe('unhealthy');
  });
});
