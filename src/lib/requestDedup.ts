/**
 * Request deduplication layer - prevents duplicate concurrent API calls.
 * If the same request key is in-flight, reuses the existing promise.
 */

const inflightRequests = new Map<string, Promise<unknown>>();

export async function dedup<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inflightRequests.get(key);
  if (existing) return existing as Promise<T>;

  const promise = fn().finally(() => {
    inflightRequests.delete(key);
  });

  inflightRequests.set(key, promise);
  return promise;
}

/**
 * Creates a dedup-wrapped version of an async function.
 */
export function withDedup<TArgs extends unknown[], TResult>(
  keyFn: (...args: TArgs) => string,
  fn: (...args: TArgs) => Promise<TResult>
): (...args: TArgs) => Promise<TResult> {
  return (...args: TArgs) => dedup(keyFn(...args), () => fn(...args));
}

/**
 * Clears all inflight request tracking (useful for testing).
 */
export function clearDedup(): void {
  inflightRequests.clear();
}

export const requestDedup = { dedup, withDedup, clear: clearDedup };
