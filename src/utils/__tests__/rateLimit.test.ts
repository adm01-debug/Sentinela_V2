import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('rateLimit utils', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  describe('token bucket algorithm', () => {
    class TokenBucket {
      private tokens: number;
      private lastRefill: number;
      
      constructor(
        private capacity: number,
        private refillRate: number
      ) {
        this.tokens = capacity;
        this.lastRefill = Date.now();
      }

      refill() {
        const now = Date.now();
        const elapsed = (now - this.lastRefill) / 1000;
        this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
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

      getTokens() { return this.tokens; }
    }

    it('should allow requests within limit', () => {
      const bucket = new TokenBucket(10, 1);
      expect(bucket.tryConsume()).toBe(true);
      expect(bucket.getTokens()).toBe(9);
    });

    it('should block requests when depleted', () => {
      const bucket = new TokenBucket(2, 1);
      bucket.tryConsume();
      bucket.tryConsume();
      expect(bucket.tryConsume()).toBe(false);
    });

    it('should refill tokens over time', () => {
      const bucket = new TokenBucket(10, 1);
      for (let i = 0; i < 10; i++) bucket.tryConsume();
      expect(bucket.getTokens()).toBe(0);
      
      vi.advanceTimersByTime(5000);
      bucket.refill();
      expect(bucket.getTokens()).toBeGreaterThan(0);
    });
  });

  describe('sliding window', () => {
    class SlidingWindow {
      private requests: number[] = [];
      
      constructor(
        private limit: number,
        private windowMs: number
      ) {}

      isAllowed(): boolean {
        const now = Date.now();
        this.requests = this.requests.filter(t => now - t < this.windowMs);
        
        if (this.requests.length < this.limit) {
          this.requests.push(now);
          return true;
        }
        return false;
      }

      getRemaining() {
        const now = Date.now();
        this.requests = this.requests.filter(t => now - t < this.windowMs);
        return this.limit - this.requests.length;
      }
    }

    it('should track requests in window', () => {
      const window = new SlidingWindow(5, 60000);
      expect(window.isAllowed()).toBe(true);
      expect(window.getRemaining()).toBe(4);
    });

    it('should block when limit reached', () => {
      const window = new SlidingWindow(2, 60000);
      window.isAllowed();
      window.isAllowed();
      expect(window.isAllowed()).toBe(false);
    });

    it('should reset after window expires', () => {
      const window = new SlidingWindow(2, 1000);
      window.isAllowed();
      window.isAllowed();
      expect(window.isAllowed()).toBe(false);
      
      vi.advanceTimersByTime(1100);
      expect(window.isAllowed()).toBe(true);
    });
  });

  describe('rate limit headers', () => {
    it('should generate rate limit headers', () => {
      const headers = {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '95',
        'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 3600),
      };
      expect(headers['X-RateLimit-Limit']).toBe('100');
      expect(parseInt(headers['X-RateLimit-Remaining'])).toBeLessThan(100);
    });

    it('should parse rate limit response', () => {
      const response = {
        headers: new Map([
          ['X-RateLimit-Limit', '100'],
          ['X-RateLimit-Remaining', '0'],
          ['Retry-After', '60'],
        ]),
      };
      const remaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '0');
      expect(remaining).toBe(0);
    });
  });

  describe('retry logic', () => {
    it('should calculate retry delay', () => {
      const calculateDelay = (attempt: number, baseDelay: number = 1000) => 
        Math.min(baseDelay * Math.pow(2, attempt), 30000);

      expect(calculateDelay(0)).toBe(1000);
      expect(calculateDelay(1)).toBe(2000);
      expect(calculateDelay(2)).toBe(4000);
      expect(calculateDelay(10)).toBe(30000);
    });

    it('should add jitter to retry delay', () => {
      const addJitter = (delay: number) => 
        delay + Math.random() * delay * 0.1;

      const base = 1000;
      const withJitter = addJitter(base);
      expect(withJitter).toBeGreaterThanOrEqual(base);
      expect(withJitter).toBeLessThanOrEqual(base * 1.1);
    });
  });

  describe('per-user rate limiting', () => {
    it('should track limits per user', () => {
      const userLimits = new Map<string, number>();
      
      const checkLimit = (userId: string, limit: number) => {
        const count = userLimits.get(userId) || 0;
        if (count >= limit) return false;
        userLimits.set(userId, count + 1);
        return true;
      };

      expect(checkLimit('user1', 2)).toBe(true);
      expect(checkLimit('user1', 2)).toBe(true);
      expect(checkLimit('user1', 2)).toBe(false);
      expect(checkLimit('user2', 2)).toBe(true);
    });
  });
});
