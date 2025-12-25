/**
 * Integration tests for resilience patterns
 */
import { CircuitBreaker, retry, RateLimiter, withTimeout } from '../../core';

describe('Resilience Integration', () => {
  it('should combine patterns', async () => {
    const circuit = new CircuitBreaker({ name: 'test', failureThreshold: 3 });
    const limiter = new RateLimiter({ maxRequests: 10, windowMs: 1000 });

    const resilientCall = async () => {
      await limiter.consumeOrThrow('test');
      return circuit.execute(() => 
        retry(() => withTimeout(() => Promise.resolve('ok'), 1000, 'test'), { maxAttempts: 2 })
      );
    };

    const result = await resilientCall();
    expect(result).toBe('ok');
  });
});
