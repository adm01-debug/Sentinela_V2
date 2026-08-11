// ============================================================
// CLIENT-SIDE RATE LIMITER
// Prevents excessive API calls from the frontend
// ============================================================

import { logger } from '@/lib/logger';

interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

interface RateLimiterConfig {
  maxTokens: number;       // Max requests in window
  refillRate: number;      // Tokens per second
  refillInterval: number;  // How often to refill (ms)
}

const DEFAULT_CONFIG: RateLimiterConfig = {
  maxTokens: 30,
  refillRate: 2,
  refillInterval: 1000,
};

class ClientRateLimiter {
  private buckets = new Map<string, RateLimitBucket>();
  private config: RateLimiterConfig;

  constructor(config: Partial<RateLimiterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check if request is allowed. Returns true if allowed, false if rate limited.
   */
  tryAcquire(key = 'global'): boolean {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = { tokens: this.config.maxTokens, lastRefill: now };
      this.buckets.set(key, bucket);
    }

    // Refill tokens
    const elapsed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor(elapsed / this.config.refillInterval) * this.config.refillRate;
    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(this.config.maxTokens, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now;
    }

    // Try to consume a token
    if (bucket.tokens > 0) {
      bucket.tokens--;
      return true;
    }

    logger.warn(`[RateLimiter] Rate limited on key: ${key}`);
    return false;
  }

  /**
   * Get remaining tokens for a key
   */
  remaining(key = 'global'): number {
    return this.buckets.get(key)?.tokens ?? this.config.maxTokens;
  }

  /**
   * Wait until a token is available, then consume it
   */
  async waitForToken(key = 'global', timeoutMs = 10000): Promise<void> {
    const start = Date.now();
    while (!this.tryAcquire(key)) {
      if (Date.now() - start > timeoutMs) {
        throw new Error(`Rate limit timeout exceeded for key: ${key}`);
      }
      await new Promise((r) => setTimeout(r, this.config.refillInterval));
    }
  }

  /**
   * Reset a specific bucket
   */
  reset(key = 'global'): void {
    this.buckets.delete(key);
  }

  /**
   * Clear all buckets
   */
  clear(): void {
    this.buckets.clear();
  }
}

// Singleton instances for different use cases
export const apiRateLimiter = new ClientRateLimiter({ maxTokens: 30, refillRate: 2 });
export const authRateLimiter = new ClientRateLimiter({ maxTokens: 5, refillRate: 1, refillInterval: 5000 });
export const exportRateLimiter = new ClientRateLimiter({ maxTokens: 3, refillRate: 1, refillInterval: 10000 });

export { ClientRateLimiter };
