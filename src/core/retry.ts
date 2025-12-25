/**
 * @packageDocumentation
 * @module Core/Retry
 * Retry logic with exponential backoff and jitter
 */
import { RetryExhaustedError } from './errors';
import { Logger, logger as defaultLogger } from './logger';

export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryOn?: (error: Error) => boolean;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 10000,
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
    delay = delay * (0.5 + Math.random());
  }
  
  return Math.floor(delay);
}

/**
 * Execute a function with retry logic
 */
export async function retry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  logger: Logger = defaultLogger
): Promise<T> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (cfg.retryOn && !cfg.retryOn(lastError)) {
        throw lastError;
      }

      if (attempt === cfg.maxAttempts) {
        break;
      }

      const delay = calculateDelay(attempt, cfg);
      logger.warn('Retry attempt failed', { attempt, maxAttempts: cfg.maxAttempts, delayMs: delay, error: lastError.message });
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new RetryExhaustedError('All retry attempts exhausted', cfg.maxAttempts, lastError);
}

/**
 * Decorator for retry logic
 */
export function Retryable(config: Partial<RetryConfig> = {}) {
  return function (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      return retry(() => originalMethod.apply(this, args), config);
    };

    return descriptor;
  };
}

/**
 * Create a retryable version of a function
 */
export function withRetry<T>(fn: () => Promise<T>, config: Partial<RetryConfig> = {}): () => Promise<T> {
  return () => retry(fn, config);
}
