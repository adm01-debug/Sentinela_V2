import { RateLimitConfig } from './types';

export class RateLimiter {
  private tokens: Map<string, { count: number; lastRefill: number }> = new Map();
  
  constructor(private config: RateLimitConfig) {}
  
  allow(clientId: string): boolean {
    if (!this.config.enabled) return true;
    const now = Date.now();
    const bucket = this.tokens.get(clientId) ?? { count: this.config.burstSize, lastRefill: now };
    const elapsed = (now - bucket.lastRefill) / 1000;
    bucket.count = Math.min(this.config.burstSize, bucket.count + elapsed * this.config.requestsPerSecond);
    bucket.lastRefill = now;
    if (bucket.count >= 1) { bucket.count--; this.tokens.set(clientId, bucket); return true; }
    return false;
  }
  
  getRemainingTokens(clientId: string): number {
    return Math.floor(this.tokens.get(clientId)?.count ?? this.config.burstSize);
  }
}