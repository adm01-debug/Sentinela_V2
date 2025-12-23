export class FixedWindow {
  private count = 0;
  private windowStart: number;
  constructor(private windowMs: number, private maxRequests: number) { this.windowStart = Date.now(); }
  tryAcquire(): boolean { const now = Date.now(); if (now - this.windowStart >= this.windowMs) { this.count = 0; this.windowStart = now; } if (this.count < this.maxRequests) { this.count++; return true; } return false; }
  getCount(): number { return this.count; }
  reset() { this.count = 0; this.windowStart = Date.now(); }
}
