/**
 * @fileoverview Basic usage examples for Sentinela
 */

import { 
  CircuitBreaker, 
  retry, 
  createLogger,
  Cache,
  RateLimiter,
  validateObject,
  required,
  email
} from '@sentinela/core';

// 1. Logger
const logger = createLogger('my-app');
logger.info('Application started', { version: '1.0.0' });

// 2. Circuit Breaker
const circuit = new CircuitBreaker({ name: 'api-circuit', failureThreshold: 5 });

async function fetchWithCircuitBreaker() {
  return circuit.execute(async () => {
    const response = await fetch('https://api.example.com/data');
    return response.json();
  });
}

// 3. Retry
async function fetchWithRetry() {
  return retry(
    () => fetch('https://api.example.com/data').then(r => r.json()),
    { maxAttempts: 3, initialDelayMs: 1000 }
  );
}

// 4. Cache
const cache = new Cache<string>({ defaultTtlMs: 60000 });
cache.set('user:123', JSON.stringify({ name: 'John' }));
const cached = cache.get('user:123');

// 5. Rate Limiter
const limiter = new RateLimiter({ maxRequests: 100, windowMs: 60000 });
const result = limiter.consume('user-123');
if (!result.allowed) {
  console.log('Rate limited, retry after:', result.retryAfter);
}

// 6. Validation
const userData = { name: 'John', email: 'john@example.com' };
const validation = validateObject(userData, {
  name: [required('name')],
  email: [required('email'), email('email')]
});

console.log('Validation result:', validation);
