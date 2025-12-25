/**
 * Basic Sentinela Usage Example
 * 
 * This example demonstrates core features:
 * - Error handling
 * - Logging
 * - Retry with circuit breaker
 * - Caching
 */

import {
  Logger,
  createLogger,
  retry,
  CircuitBreaker,
  Cache,
  ValidationError,
  NotFoundError
} from '@sentinela/core';

// Create a logger
const logger = createLogger('example-app');

// Create a cache
const cache = new Cache<string>({ defaultTtlMs: 60000 });

// Create a circuit breaker
const apiCircuit = new CircuitBreaker({
  name: 'external-api',
  failureThreshold: 3,
  resetTimeout: 30000
});

// Simulated external API call
async function fetchUserFromApi(userId: string): Promise<{ id: string; name: string }> {
  // Simulate API call
  if (Math.random() > 0.7) {
    throw new Error('API temporarily unavailable');
  }
  return { id: userId, name: `User ${userId}` };
}

// Main function with all patterns
async function getUser(userId: string): Promise<{ id: string; name: string }> {
  // Validate input
  if (!userId) {
    throw new ValidationError('User ID is required', 'userId', userId);
  }

  // Check cache first
  const cached = cache.get(`user:${userId}`);
  if (cached) {
    logger.debug('Cache hit', { userId });
    return JSON.parse(cached);
  }

  logger.info('Fetching user from API', { userId });

  // Use circuit breaker with retry
  const user = await apiCircuit.execute(() =>
    retry(
      () => fetchUserFromApi(userId),
      { maxAttempts: 3, initialDelayMs: 500 }
    )
  );

  // Cache the result
  cache.set(`user:${userId}`, JSON.stringify(user));
  
  return user;
}

// Run example
async function main() {
  try {
    const user = await getUser('123');
    logger.info('User fetched successfully', { user });

    // Fetch again (should hit cache)
    const cachedUser = await getUser('123');
    logger.info('User from cache', { cachedUser });

  } catch (error) {
    if (error instanceof ValidationError) {
      logger.error('Validation failed', error, { field: error.field });
    } else {
      logger.error('Failed to fetch user', error as Error);
    }
  }
}

main();
