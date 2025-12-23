export class SlidingWindow {
  private requests: number[] = [];
  constructor(private windowMs: number, private maxRequests: number) {}
  tryAcquire(): boolean { const now = Date.now(); this.requests = this.requests.filter(t => now - t < this.windowMs); if (this.requests.length < this.maxRequests) { this.requests.push(now); return true; } return false; }
  getCount(): number { const now = Date.now(); this.requests = this.requests.filter(t => now - t < this.windowMs); return this.requests.length; }
  getRemainingRequests(): number { return Math.max(0, this.maxRequests - this.getCount()); }
}
