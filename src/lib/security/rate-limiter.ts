interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export function createRateLimiter(config: RateLimitConfig) {
  return {
    check(key: string): { allowed: boolean; remaining: number; resetAt: number } {
      const now = Date.now();
      const entry = store.get(key);
      
      if (!entry || entry.resetAt < now) {
        store.set(key, { count: 1, resetAt: now + config.windowMs });
        return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
      }
      
      if (entry.count >= config.maxRequests) {
        return { allowed: false, remaining: 0, resetAt: entry.resetAt };
      }
      
      entry.count++;
      return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
    },
    
    reset(key: string): void {
      store.delete(key);
    }
  };
}

export const apiRateLimiter = createRateLimiter({ windowMs: 60000, maxRequests: 100 });
export const authRateLimiter = createRateLimiter({ windowMs: 300000, maxRequests: 5 });
