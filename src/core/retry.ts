/**
 * @fileoverview Retry utilities with exponential backoff
 * @module @sentinela/core/retry
 */

import { RetryExhaustedError } from './errors';
import { createLogger } from './logger';

const logger = createLogger('retry');

export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryableErrors?: (error: Error) => boolean;
  onRetry?: (attempt: number, error: Error, delayMs: number) => void;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitter: true
};

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  let delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
  delay = Math.min(delay, config.maxDelayMs);
  
  if (config.jitter) {
    const jitterRange = delay * 0.2;
    delay = delay + (Math.random() * jitterRange * 2 - jitterRange);
  }
  
  return Math.floor(delay);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute function with retry logic
 */
export async function retry<T>(
  fn: () => Promise<T>,
  config?: Partial<RetryConfig>
): Promise<T> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      const shouldRetry = cfg.retryableErrors 
        ? cfg.retryableErrors(lastError) 
        : true;

      if (!shouldRetry || attempt === cfg.maxAttempts) {
        logger.error(`Retry exhausted after ${attempt} attempts`, lastError, { attempt });
        throw new RetryExhaustedError(attempt, lastError);
      }

      const delayMs = calculateDelay(attempt, cfg);
      
      logger.warn(`Attempt ${attempt} failed, retrying in ${delayMs}ms`, {
        attempt,
        maxAttempts: cfg.maxAttempts,
        delayMs,
        error: lastError.message
      });

      cfg.onRetry?.(attempt, lastError, delayMs);
      await sleep(delayMs);
    }
  }

  throw new RetryExhaustedError(cfg.maxAttempts, lastError);
}

/**
 * Decorator for retry logic
 */
export function Retry(config?: Partial<RetryConfig>) {
  return function <T extends (...args: unknown[]) => Promise<unknown>>(
    target: object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> {
    const originalMethod = descriptor.value!;
    
    descriptor.value = async function (...args: unknown[]) {
      return retry(() => originalMethod.apply(this, args), config);
    } as T;
    
    return descriptor;
  };
}

/**
 * Create a retryable version of a function
 */
export function withRetry<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  config?: Partial<RetryConfig>
): T {
  return (async (...args: unknown[]) => {
    return retry(() => fn(...args), config);
  }) as T;
}
