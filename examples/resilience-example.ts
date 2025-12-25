/**
 * Resilience patterns example
 */
import { retry, CircuitBreaker, RateLimiter, Bulkhead, BackpressureController } from '../src';
const breaker = new CircuitBreaker({ failureThreshold: 5, resetTimeout: 30000 });
const limiter = new RateLimiter({ maxRequests: 100, windowMs: 60000 });
const bulkhead = new Bulkhead({ maxConcurrent: 10, maxQueue: 50 });
const backpressure = new BackpressureController({ highWaterMark: 100, lowWaterMark: 50 });
async function resilientCall<T>(fn: () => Promise<T>): Promise<T> {
  if (!limiter.consume('api')) throw new Error('Rate limited');
  if (backpressure.shouldPause()) throw new Error('Backpressure');
  return bulkhead.execute(() => breaker.execute(() => retry(fn, { maxAttempts: 3 })));
}
