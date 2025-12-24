// Semaphore for Bulkhead
export class Semaphore {
  private permits: number; private waiters: (() => void)[] = [];
  constructor(private maxPermits: number) { this.permits = maxPermits; }
  async acquire(): Promise<void> {
    if (this.permits > 0) { this.permits--; return; }
    await new Promise<void>(resolve => this.waiters.push(resolve));
    this.permits--;
  }
  release(): void { this.permits++; if (this.waiters.length > 0 && this.permits > 0) this.waiters.shift()?.(); }
  available(): number { return this.permits; }
}
