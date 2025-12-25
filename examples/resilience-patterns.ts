/**
 * @fileoverview Resilience patterns example
 */

import { 
  CircuitBreaker, 
  retry, 
  RateLimiter,
  withTimeout,
  Bulkhead
} from '@sentinela/core';

// Combine patterns for robust external calls
async function resilientApiCall(url: string): Promise<unknown> {
  const circuit = new CircuitBreaker({ 
    name: 'external-api',
    failureThreshold: 5,
    resetTimeout: 30000
  });
  
  const limiter = new RateLimiter({ 
    maxRequests: 100, 
    windowMs: 60000 
  });
  
  const bulkhead = new Bulkhead({ 
    maxConcurrent: 10, 
    maxQueue: 50 
  });

  return bulkhead.execute(async () => {
    await limiter.consumeOrThrow('api-calls');
    
    return circuit.execute(() => 
      retry(
        () => withTimeout(
          () => fetch(url).then(r => r.json()),
          5000,
          'api-fetch'
        ),
        { maxAttempts: 3, initialDelayMs: 1000 }
      )
    );
  });
}

// Usage
async function main() {
  try {
    const data = await resilientApiCall('https://api.example.com/data');
    console.log('Data:', data);
  } catch (error) {
    console.error('Failed after all resilience measures:', error);
  }
}

main();
