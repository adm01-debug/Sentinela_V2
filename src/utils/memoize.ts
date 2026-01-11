// Memoization utilities for Sentinela v17

type AnyFunction = (...args: any[]) => any;

export function memoize<T extends AnyFunction>(
  fn: T,
  options?: { maxSize?: number; ttl?: number }
): T {
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>();
  const maxSize = options?.maxSize ?? 100;
  const ttl = options?.ttl ?? 0;

  return ((...args: Parameters<T>): ReturnType<T> => {
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
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }
    
    cache.set(key, { value: result, timestamp: Date.now() });
    return result;
  }) as T;
}

export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: { maxSize?: number; ttl?: number }
): T {
  const cache = new Map<string, { value: Awaited<ReturnType<T>>; timestamp: number }>();
  const pending = new Map<string, Promise<Awaited<ReturnType<T>>>>();
  const maxSize = options?.maxSize ?? 100;
  const ttl = options?.ttl ?? 0;

  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
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
        const firstKey = cache.keys().next().value;
        if (firstKey) cache.delete(firstKey);
      }
      
      cache.set(key, { value: result, timestamp: Date.now() });
      return result;
    } finally {
      pending.delete(key);
    }
  }) as T;
}

export function memoizeOne<T extends AnyFunction>(fn: T): T {
  let lastArgs: Parameters<T> | undefined;
  let lastResult: ReturnType<T>;
  let hasResult = false;

  return ((...args: Parameters<T>): ReturnType<T> => {
    if (hasResult && lastArgs && argsEqual(lastArgs, args)) {
      return lastResult;
    }

    lastArgs = args;
    lastResult = fn(...args);
    hasResult = true;
    return lastResult;
  }) as T;
}

function argsEqual(a: any[], b: any[]): boolean {
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
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
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
