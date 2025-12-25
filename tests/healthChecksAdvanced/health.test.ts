import { HealthChecker, HealthCheck, HealthStatus } from '../../healthChecksAdvanced';
describe('HealthChecker', () => {
  let checker: HealthChecker;
  beforeEach(() => { checker = new HealthChecker(); });
  it('should register health check', () => {
    checker.register('database', async () => ({ status: 'healthy' }));
    expect(checker.getChecks()).toContain('database');
  });
  it('should run all checks', async () => {
    checker.register('db', async () => ({ status: 'healthy' }));
    checker.register('cache', async () => ({ status: 'healthy' }));
    const result = await checker.runAll();
    expect(result.status).toBe('healthy');
    expect(Object.keys(result.checks).length).toBe(2);
  });
  it('should report unhealthy', async () => {
    checker.register('failing', async () => ({ status: 'unhealthy', error: 'Connection failed' }));
    const result = await checker.runAll();
    expect(result.status).toBe('unhealthy');
  });
  it('should timeout slow checks', async () => {
    checker.register('slow', async () => {
      await new Promise(r => setTimeout(r, 5000));
      return { status: 'healthy' };
    }, { timeout: 100 });
    const result = await checker.runAll();
    expect(result.checks['slow'].status).toBe('timeout');
  });
});