export class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  constructor(private capacity: number, private refillRate: number) { this.tokens = capacity; this.lastRefill = Date.now(); }
  consume(count = 1): boolean { this.refill(); if (this.tokens >= count) { this.tokens -= count; return true; } return false; }
  private refill() { const now = Date.now(); const elapsed = (now - this.lastRefill) / 1000; this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate); this.lastRefill = now; }
  getTokens(): number { this.refill(); return Math.floor(this.tokens); }
}
