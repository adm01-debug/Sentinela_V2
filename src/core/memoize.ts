/**
 * @fileoverview Memoization utilities
 * @module @sentinela/core/memoize
 */
export function memoize<T extends (...args: unknown[]) => unknown>(fn: T, keyFn?: (...args: Parameters<T>) => string): T {
  const cache = new Map<string, ReturnType<T>>();
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args) as ReturnType<T>;
    cache.set(key, result);
    return result;
  }) as T;
}
export function memoizeAsync<T extends (...args: unknown[]) => Promise<unknown>>(fn: T): T {
  const cache = new Map<string, Promise<unknown>>();
  return ((...args: Parameters<T>): Promise<unknown> => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;
    const promise = fn(...args);
    cache.set(key, promise);
    promise.catch(() => cache.delete(key));
    return promise;
  }) as T;
}
