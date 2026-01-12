interface RateLimitOptions { limit: number; window: number; }

export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private limit: number;
  private window: number;

  constructor(options: RateLimitOptions) {
    this.limit = options.limit;
    this.window = options.window;
    this.tokens = this.limit;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const refillAmount = Math.floor(elapsed / this.window) * this.limit;
    this.tokens = Math.min(this.limit, this.tokens + refillAmount);
    this.lastRefill = now;
  }

  tryAcquire(): boolean {
    this.refill();
    if (this.tokens > 0) { this.tokens--; return true; }
    return false;
  }

  async acquire(): Promise<void> {
    while (!this.tryAcquire()) {
      await new Promise(r => setTimeout(r, this.window / this.limit));
    }
  }

  get remaining(): number { this.refill(); return this.tokens; }
}

export function createRateLimiter(limit: number, windowMs: number): RateLimiter {
  return new RateLimiter({ limit, window: windowMs });
}
