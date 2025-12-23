export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  constructor(private maxTokens: number, private refillInterval: number) { this.tokens = maxTokens; this.lastRefill = Date.now(); }
  private refill() { const now = Date.now(); const elapsed = now - this.lastRefill; const tokensToAdd = Math.floor(elapsed / this.refillInterval) * this.maxTokens; if (tokensToAdd > 0) { this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd); this.lastRefill = now; } }
  tryAcquire(tokens = 1): boolean { this.refill(); if (this.tokens >= tokens) { this.tokens -= tokens; return true; } return false; }
  getAvailableTokens(): number { this.refill(); return this.tokens; }
}
