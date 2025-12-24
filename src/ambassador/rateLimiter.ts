// Ambassador Rate Limiter
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (ctx: { ip?: string; userId?: string }) => string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export class RateLimiter {
  private windows: Map<string, { count: number; resetAt: Date }> = new Map();

  constructor(private config: RateLimitConfig) {}

  check(ctx: { ip?: string; userId?: string }): RateLimitResult {
    const key = this.config.keyGenerator?.(ctx) || ctx.ip || "default";
    const now = new Date();
    let window = this.windows.get(key);

    if (!window || window.resetAt < now) {
      window = { count: 0, resetAt: new Date(now.getTime() + this.config.windowMs) };
      this.windows.set(key, window);
    }

    window.count++;
    const allowed = window.count <= this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - window.count);

    return { allowed, remaining, resetAt: window.resetAt };
  }

  reset(key: string): void {
    this.windows.delete(key);
  }

  getStatus(key: string): { count: number; resetAt: Date } | null {
    return this.windows.get(key) || null;
  }
}
