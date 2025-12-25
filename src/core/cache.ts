/**
 * @fileoverview Caching utilities
 * @module @sentinela/core/cache
 */

import { Disposable } from './disposable';
import { createLogger } from './logger';

const logger = createLogger('cache');

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

export interface CacheConfig {
  defaultTtlMs: number;
  maxSize: number;
  cleanupIntervalMs: number;
}

const DEFAULT_CONFIG: CacheConfig = {
  defaultTtlMs: 60000,
  maxSize: 1000,
  cleanupIntervalMs: 30000
};

/**
 * In-memory cache with TTL support
 */
export class Cache<T = unknown> implements Disposable {
  private readonly entries: Map<string, CacheEntry<T>> = new Map();
  private readonly config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config?: Partial<CacheConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startCleanup();
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupIntervalMs);
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.entries) {
      if (entry.expiresAt < now) {
        this.entries.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.debug(`Cleaned ${cleaned} expired entries`);
    }
  }

  private evictIfNeeded(): void {
    while (this.entries.size >= this.config.maxSize) {
      const oldestKey = this.entries.keys().next().value;
      if (oldestKey) {
        this.entries.delete(oldestKey);
      }
    }
  }

  set(key: string, value: T, ttlMs?: number): void {
    this.evictIfNeeded();
    
    const now = Date.now();
    this.entries.set(key, {
      value,
      expiresAt: now + (ttlMs ?? this.config.defaultTtlMs),
      createdAt: now
    });
  }

  get(key: string): T | undefined {
    const entry = this.entries.get(key);
    
    if (!entry) return undefined;
    
    if (entry.expiresAt < Date.now()) {
      this.entries.delete(key);
      return undefined;
    }
    
    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): boolean {
    return this.entries.delete(key);
  }

  clear(): void {
    this.entries.clear();
  }

  size(): number {
    return this.entries.size;
  }

  /**
   * Get or compute value
   */
  async getOrSet(
    key: string,
    factory: () => Promise<T>,
    ttlMs?: number
  ): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) return cached;
    
    const value = await factory();
    this.set(key, value, ttlMs);
    return value;
  }

  /**
   * Memoize a function
   */
  memoize<Args extends unknown[], R extends T>(
    fn: (...args: Args) => Promise<R>,
    keyFn: (...args: Args) => string,
    ttlMs?: number
  ): (...args: Args) => Promise<R> {
    return async (...args: Args) => {
      const key = keyFn(...args);
      return this.getOrSet(key, () => fn(...args), ttlMs) as Promise<R>;
    };
  }

  dispose(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

/**
 * LRU Cache implementation
 */
export class LRUCache<T = unknown> implements Disposable {
  private readonly cache: Map<string, T> = new Map();
  private readonly maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: string): T | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  dispose(): void {
    this.clear();
  }
}

/**
 * Decorator for caching method results
 */
export function Cached(cache: Cache, keyFn?: (...args: unknown[]) => string, ttlMs?: number) {
  return function <T extends (...args: unknown[]) => Promise<unknown>>(
    target: object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> {
    const originalMethod = descriptor.value!;
    
    descriptor.value = async function (...args: unknown[]) {
      const key = keyFn ? keyFn(...args) : `${propertyKey}:${JSON.stringify(args)}`;
      return cache.getOrSet(key, () => originalMethod.apply(this, args), ttlMs);
    } as T;
    
    return descriptor;
  };
}
