export interface RateLimitConfig { windowMs: number; maxRequests: number; }
export class RateLimiter {
  private requests = new Map<string, { count: number; resetAt: number }>();
  private config: RateLimitConfig = { windowMs: 60000, maxRequests: 100 };
  configure(config: RateLimitConfig): void { this.config = config; }
  check(key: string): { allowed: boolean; remaining: number; resetAt: number } { const now = Date.now(); let entry = this.requests.get(key); if (!entry || entry.resetAt < now) { entry = { count: 0, resetAt: now + this.config.windowMs }; } entry.count++; this.requests.set(key, entry); const allowed = entry.count <= this.config.maxRequests; return { allowed, remaining: Math.max(0, this.config.maxRequests - entry.count), resetAt: entry.resetAt }; }
  reset(key: string): void { this.requests.delete(key); }
}
export const rateLimiter = new RateLimiter();
