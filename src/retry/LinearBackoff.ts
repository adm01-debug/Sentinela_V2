export class LinearBackoff {
  private attempt = 0;
  constructor(private delayMs = 1000, private maxDelayMs = 10000, private increment = 1000) {}
  getDelay(): number { const delay = Math.min(this.delayMs + this.increment * this.attempt, this.maxDelayMs); this.attempt++; return delay; }
  reset() { this.attempt = 0; }
  async wait(): Promise<void> { await new Promise(r => setTimeout(r, this.getDelay())); }
}
