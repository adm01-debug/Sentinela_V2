import { Request, Response } from './types';
import { PluginHandler } from './gateway';

export class RateLimiter implements PluginHandler {
  private requests: Map<string, { count: number; resetAt: Date }> = new Map();
  
  constructor(private limit: number, private windowSeconds: number) {}
  
  async preRequest(req: Request): Promise<Request> {
    const key = this.getKey(req);
    const now = new Date();
    let bucket = this.requests.get(key);
    
    if (!bucket || bucket.resetAt < now) {
      bucket = { count: 0, resetAt: new Date(now.getTime() + this.windowSeconds * 1000) };
    }
    
    bucket.count++;
    this.requests.set(key, bucket);
    
    if (bucket.count > this.limit) throw new Error('Rate limit exceeded');
    return req;
  }
  
  private getKey(req: Request): string { return req.headers['x-api-key'] ?? req.headers['x-forwarded-for'] ?? 'anonymous'; }
  
  getStats(key: string): { remaining: number; resetAt: Date } | undefined {
    const bucket = this.requests.get(key);
    if (!bucket) return undefined;
    return { remaining: Math.max(0, this.limit - bucket.count), resetAt: bucket.resetAt };
  }
}