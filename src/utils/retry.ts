// Retry utilities for Sentinela v17

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  maxDelay?: number;
  backoff?: 'linear' | 'exponential' | 'fixed';
  backoffFactor?: number;
  retryOn?: (error: Error) => boolean;
  onRetry?: (error: Error, attempt: number) => void;
  signal?: AbortSignal;
}

const defaultOptions: Required<Omit<RetryOptions, 'retryOn' | 'onRetry' | 'signal'>> = {
  maxAttempts: 3,
  delay: 1000,
  maxDelay: 30000,
  backoff: 'exponential',
  backoffFactor: 2,
};

function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  let delay: number;
  switch (options.backoff) {
    case 'linear':
      delay = options.delay * attempt;
      break;
    case 'exponential':
      delay = options.delay * Math.pow(options.backoffFactor, attempt - 1);
      break;
    case 'fixed':
    default:
      delay = options.delay;
  }
  return Math.min(delay, options.maxDelay);
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options } as Required<RetryOptions>;
  let lastError: Error = new Error('Retry failed');

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    if (opts.signal?.aborted) {
      throw new Error('Retry aborted');
    }

    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === opts.maxAttempts) {
        throw lastError;
      }

      if (opts.retryOn && !opts.retryOn(lastError)) {
        throw lastError;
      }

      opts.onRetry?.(lastError, attempt);

      const delay = calculateDelay(attempt, opts);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export function retryable<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: RetryOptions = {}
): (...args: TArgs) => Promise<TResult> {
  return (...args: TArgs) => retry(() => fn(...args), options);
}

export async function retryWithFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  try {
    return await retry(primary, options);
  } catch {
    return fallback();
  }
}

export async function retryUntil<T>(
  fn: () => Promise<T>,
  predicate: (result: T) => boolean,
  options: Omit<RetryOptions, 'retryOn'> = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    const result = await fn();
    if (predicate(result)) {
      return result;
    }

    if (attempt < opts.maxAttempts) {
      const delay = calculateDelay(attempt, opts as Required<RetryOptions>);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return fn();
}

export class RetryError extends Error {
  constructor(
    message: string,
    public readonly attempts,
    public readonly lastError: Error
  ) {
    super(message);
    this.name = 'RetryError';
  }
}

export function isRetryable(error: Error): boolean {
  const retryableCodes = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN'];
  const retryableStatuses = [408, 429, 500, 502, 503, 504];

  if ('code' in error && retryableCodes.includes((error as Error & { code: string }).code)) {
    return true;
  }
  if ('status' in error && retryableStatuses.includes((error as Error & { status: number }).status)) {
    return true;
  }
  return false;
}
