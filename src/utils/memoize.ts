// Memoization utilities for Sentinela v17

type AnyFunction<TArgs extends unknown[] = unknown[], TResult = unknown> = (...args: TArgs) => TResult;

export function memoize<TArgs extends unknown[], TResult>(
  fn: AnyFunction<TArgs, TResult>,
  options?: { maxSize?: number; ttl?: number }
): AnyFunction<TArgs, TResult> {
  const cache = new Map<string, { value: TResult; timestamp: number }>();
  const maxSize = options?.maxSize ?? 100;
  const ttl = options?.ttl ?? 0;

  return (...args: TArgs): TResult => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);

    if (cached) {
      if (ttl === 0 || Date.now() - cached.timestamp < ttl) {
        return cached.value;
      }
      cache.delete(key);
    }

    const result = fn(...args);

    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value as string | undefined;
      if (firstKey !== undefined) cache.delete(firstKey);
    }

    cache.set(key, { value: result, timestamp: Date.now() });
    return result;
  };
}

export function memoizeAsync<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options?: { maxSize?: number; ttl?: number }
): (...args: TArgs) => Promise<TResult> {
  const cache = new Map<string, { value: TResult; timestamp: number }>();
  const pending = new Map<string, Promise<TResult>>();
  const maxSize = options?.maxSize ?? 100;
  const ttl = options?.ttl ?? 0;

  return async (...args: TArgs): Promise<TResult> => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);

    if (cached) {
      if (ttl === 0 || Date.now() - cached.timestamp < ttl) {
        return cached.value;
      }
      cache.delete(key);
    }

    const existingPending = pending.get(key);
    if (existingPending) {
      return existingPending;
    }

    const promise = fn(...args);
    pending.set(key, promise);

    try {
      const result = await promise;

      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value as string | undefined;
        if (firstKey !== undefined) cache.delete(firstKey);
      }

      cache.set(key, { value: result, timestamp: Date.now() });
      return result;
    } finally {
      pending.delete(key);
    }
  };
}

export function memoizeOne<TArgs extends unknown[], TResult>(
  fn: AnyFunction<TArgs, TResult>
): AnyFunction<TArgs, TResult> {
  let lastArgs: TArgs | undefined;
  let lastResult: TResult;
  let hasResult = false;

  return (...args: TArgs): TResult => {
    if (hasResult && lastArgs && argsEqual(lastArgs, args)) {
      return lastResult;
    }

    lastArgs = args;
    lastResult = fn(...args);
    hasResult = true;
    return lastResult;
  };
}

function argsEqual(a: readonly unknown[], b: readonly unknown[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((arg, i) => arg === b[i]);
}

export class MemoCache<K, V> {
  private cache = new Map<K, { value: V; timestamp: number }>();
  private maxSize: number;
  private ttl: number;

  constructor(options?: { maxSize?: number; ttl?: number }) {
    this.maxSize = options?.maxSize ?? 100;
    this.ttl = options?.ttl ?? 0;
  }

  get(key: K): V | undefined {
    const cached = this.cache.get(key);
    if (!cached) return undefined;

    if (this.ttl > 0 && Date.now() - cached.timestamp >= this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return cached.value;
  }

  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value as K | undefined;
      if (firstKey !== undefined) this.cache.delete(firstKey);
    }
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}
