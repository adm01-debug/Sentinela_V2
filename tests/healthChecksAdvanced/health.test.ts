import { HealthChecker, HealthStatus, HealthIndicator } from '../../healthChecksAdvanced';
describe('HealthChecker', () => {
  let checker: HealthChecker;
  beforeEach(() => { checker = new HealthChecker(); });
  it('should register health indicator', () => {
    checker.register('database', async () => ({ status: 'UP', details: { latency: 10 } }));
    expect(checker.getIndicators()).toContain('database');
  });
  it('should check all indicators', async () => {
    checker.register('db', async () => ({ status: 'UP' }));
    checker.register('cache', async () => ({ status: 'UP' }));
    const health = await checker.check();
    expect(health.status).toBe('UP');
    expect(Object.keys(health.components).length).toBe(2);
  });
  it('should report DOWN if any indicator fails', async () => {
    checker.register('healthy', async () => ({ status: 'UP' }));
    checker.register('unhealthy', async () => ({ status: 'DOWN', reason: 'Connection failed' }));
    const health = await checker.check();
    expect(health.status).toBe('DOWN');
  });
  it('should handle timeout', async () => {
    checker.register('slow', async () => {
      await new Promise(r => setTimeout(r, 5000));
      return { status: 'UP' };
    }, { timeout: 100 });
    const health = await checker.check();
    expect(health.components.slow.status).toBe('DOWN');
  });
});