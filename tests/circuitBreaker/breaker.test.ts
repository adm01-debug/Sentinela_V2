import { CircuitBreaker, CircuitBreakerConfig } from '../../src/bulkhead';

describe('CircuitBreaker Advanced', () => {
  it('should track metrics', async () => {
    const breaker = new CircuitBreaker('test', {
      failureThreshold: 3,
      resetTimeoutMs: 1000
    });

    await breaker.execute(() => Promise.resolve('ok'));
    const stats = breaker.getStats();
    
    expect(stats.totalCalls).toBeGreaterThan(0);
  });
});
