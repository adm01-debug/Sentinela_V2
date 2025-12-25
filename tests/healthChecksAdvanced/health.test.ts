import { HealthChecker } from '../../healthChecksAdvanced';
describe('HealthChecker', () => {
  let checker: HealthChecker;
  beforeEach(() => { checker = new HealthChecker(); });
  it('should run all checks', async () => {
    checker.register({ name: 'db', check: async () => ({ status: 'healthy', latency: 5 }) });
    checker.register({ name: 'cache', check: async () => ({ status: 'healthy', latency: 2 }) });
    const results = await checker.runAll();
    expect(results.db.status).toBe('healthy');
    expect(results.cache.status).toBe('healthy');
  });
});
