/**
 * @fileoverview Rate limiting utilities
 * @module @sentinela/core/rate-limiter
 */

import { RateLimitError } from './errors';
import { createLogger } from './logger';

const logger = createLogger('rate-limiter');

export interface RateLimiterConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

/**
 * In-memory rate limiter using sliding window
 */
export class RateLimiter {
  private readonly windows: Map<string, number[]> = new Map();
  private readonly config: RateLimiterConfig;

  constructor(config: RateLimiterConfig) {
    this.config = config;
  }

  private getKey(identifier: string): string {
    return this.config.keyPrefix ? `${this.config.keyPrefix}:${identifier}` : identifier;
  }

  private cleanExpiredEntries(key: string): void {
    const now = Date.now();
    const cutoff = now - this.config.windowMs;
    const entries = this.windows.get(key) || [];
    const valid = entries.filter(ts => ts > cutoff);
    this.windows.set(key, valid);
  }

  check(identifier: string): RateLimitResult {
    const key = this.getKey(identifier);
    this.cleanExpiredEntries(key);
    
    const entries = this.windows.get(key) || [];
    const remaining = Math.max(0, this.config.maxRequests - entries.length);
    const resetAt = entries.length > 0 
      ? new Date(entries[0] + this.config.windowMs)
      : new Date(Date.now() + this.config.windowMs);

    return {
      allowed: remaining > 0,
      remaining,
      resetAt,
      retryAfter: remaining > 0 ? undefined : Math.ceil((resetAt.getTime() - Date.now()) / 1000)
    };
  }

  consume(identifier: string): RateLimitResult {
    const result = this.check(identifier);
    
    if (result.allowed) {
      const key = this.getKey(identifier);
      const entries = this.windows.get(key) || [];
      entries.push(Date.now());
      this.windows.set(key, entries);
      result.remaining--;
    }

    return result;
  }

  async consumeOrThrow(identifier: string): Promise<RateLimitResult> {
    const result = this.consume(identifier);
    
    if (!result.allowed) {
      throw new RateLimitError(
        `Rate limit exceeded for ${identifier}`,
        result.retryAfter
      );
    }

    return result;
  }

  reset(identifier: string): void {
    const key = this.getKey(identifier);
    this.windows.delete(key);
  }

  dispose(): void {
    this.windows.clear();
  }
}

/**
 * Token bucket rate limiter
 */
export class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number;

  constructor(maxTokens: number, refillRatePerSecond: number) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.refillRate = refillRatePerSecond;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const newTokens = elapsed * this.refillRate;
    
    this.tokens = Math.min(this.maxTokens, this.tokens + newTokens);
    this.lastRefill = now;
  }

  tryConsume(tokens: number = 1): boolean {
    this.refill();
    
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    
    return false;
  }

  getAvailableTokens(): number {
    this.refill();
    return this.tokens;
  }
}

/**
 * Decorator for rate limiting
 */
export function RateLimit(limiter: RateLimiter, keyFn: (...args: unknown[]) => string) {
  return function <T extends (...args: unknown[]) => Promise<unknown>>(
    target: object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> {
    const originalMethod = descriptor.value!;
    
    descriptor.value = async function (...args: unknown[]) {
      const key = keyFn(...args);
      await limiter.consumeOrThrow(key);
      return originalMethod.apply(this, args);
    } as T;
    
    return descriptor;
  };
}
