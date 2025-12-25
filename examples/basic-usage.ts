/**
 * @fileoverview Basic usage example for Sentinela
 * @example
 * npx ts-node examples/basic-usage.ts
 */

import {
  createLogger,
  CircuitBreaker,
  retry,
  Cache,
  RateLimiter,
  Counter,
  Histogram,
  metrics
} from '@sentinela/core';

// 1. Logging
const logger = createLogger('my-app');
logger.info('Application starting', { version: '1.0.0' });

// 2. Circuit Breaker
async function callExternalAPI(): Promise<string> {
  const circuit = new CircuitBreaker({
    name: 'external-api',
    failureThreshold: 3,
    resetTimeout: 30000
  });

  return circuit.execute(async () => {
    // Simulated API call
    const response = await fetch('https://api.example.com/data');
    return response.json();
  });
}

// 3. Retry with backoff
async function fetchWithRetry(): Promise<void> {
  const data = await retry(
    async () => {
      logger.debug('Attempting to fetch data');
      return callExternalAPI();
    },
    {
      maxAttempts: 3,
      initialDelayMs: 1000,
      backoffMultiplier: 2,
      jitter: true
    }
  );
  
  logger.info('Data fetched successfully', { data });
}

// 4. Caching
const cache = new Cache<string>({
  defaultTtlMs: 60000,
  maxSize: 100
});

async function getCachedData(key: string): Promise<string> {
  return cache.getOrSet(key, async () => {
    return callExternalAPI();
  });
}

// 5. Rate Limiting
const limiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000,
  keyPrefix: 'api'
});

async function handleRequest(userId: string): Promise<void> {
  await limiter.consumeOrThrow(userId);
  // Process request...
}

// 6. Metrics
const requestCounter = metrics.counter('http_requests_total', 'Total HTTP requests');
const requestDuration = metrics.histogram('http_request_duration_ms', 'Request duration');

async function handleHTTPRequest(): Promise<void> {
  requestCounter.inc();
  
  await requestDuration.time(async () => {
    // Process request
    await new Promise(r => setTimeout(r, 100));
  });
}

// Main
async function main() {
  try {
    logger.info('Running examples...');
    
    await fetchWithRetry();
    await getCachedData('user:123');
    await handleRequest('user-1');
    await handleHTTPRequest();
    
    // Print metrics
    console.log('Metrics:', metrics.getAll());
    
    logger.info('Examples completed successfully');
  } catch (error) {
    logger.error('Example failed', error as Error);
  } finally {
    cache.dispose();
    limiter.dispose();
  }
}

main();
