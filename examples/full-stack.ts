/**
 * Full stack example combining multiple patterns
 */
import { retry, CircuitBreaker, RateLimiter, Logger, Cache } from '../src';
const logger = new Logger({ level: 'info' });
const cache = new Cache<string, unknown>({ maxSize: 100 });
const limiter = new RateLimiter({ maxRequests: 100, windowMs: 60000 });
const breaker = new CircuitBreaker({ failureThreshold: 5, resetTimeout: 30000 });
async function fetchData(id: string) {
  if (!limiter.consume(id)) throw new Error('Rate limited');
  const cached = cache.get(id);
  if (cached) return cached;
  return breaker.execute(async () => {
    return retry(async () => {
      const data = { id, ts: Date.now() };
      cache.set(id, data);
      return data;
    }, { maxAttempts: 3 });
  });
}
