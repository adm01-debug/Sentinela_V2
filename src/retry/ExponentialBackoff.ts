export class ExponentialBackoff {
  private attempt = 0;
  constructor(private baseDelayMs = 1000, private maxDelayMs = 30000, private multiplier = 2) {}
  getDelay(): number { const delay = Math.min(this.baseDelayMs * Math.pow(this.multiplier, this.attempt), this.maxDelayMs); this.attempt++; return delay; }
  reset() { this.attempt = 0; }
  async wait(): Promise<void> { await new Promise(r => setTimeout(r, this.getDelay())); }
}
