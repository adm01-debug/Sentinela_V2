/**
 * Resilience Patterns Example
 * 
 * Demonstrates:
 * - Circuit Breaker
 * - Retry with backoff
 * - Rate Limiting
 * - Bulkhead
 */

import {
  CircuitBreaker,
  retry,
  RateLimiter,
  withTimeout,
  createLogger
} from '@sentinela/core';

const logger = createLogger('resilience-example');

// External service simulation
async function unreliableService(shouldFail: boolean): Promise<string> {
  await new Promise(r => setTimeout(r, 100));
  if (shouldFail) throw new Error('Service unavailable');
  return 'Success!';
}

// Circuit breaker setup
const circuit = new CircuitBreaker({
  name: 'external-service',
  failureThreshold: 3,
  successThreshold: 2,
  resetTimeout: 10000
});

// Rate limiter setup
const rateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 1000
});

// Combined resilience pattern
async function resilientCall(userId: string): Promise<string> {
  // Rate limiting
  const rateResult = rateLimiter.consume(userId);
  if (!rateResult.allowed) {
    throw new Error(\`Rate limited. Retry after \${rateResult.retryAfter}s\`);
  }

  // Circuit breaker + retry + timeout
  return circuit.execute(() =>
    withTimeout(
      () => retry(
        () => unreliableService(Math.random() > 0.7),
        { maxAttempts: 3, initialDelayMs: 200 }
      ),
      5000,
      'external-service-call'
    )
  );
}

// Main
async function main() {
  logger.info('Starting resilience demo');

  for (let i = 0; i < 20; i++) {
    try {
      const result = await resilientCall('user-1');
      logger.info(\`Call \${i + 1} succeeded: \${result}\`);
    } catch (error) {
      logger.error(\`Call \${i + 1} failed\`, error as Error);
    }
    
    await new Promise(r => setTimeout(r, 200));
  }

  logger.info('Circuit state:', { state: circuit.getState() });
  logger.info('Circuit metrics:', circuit.getMetrics());
}

main();
