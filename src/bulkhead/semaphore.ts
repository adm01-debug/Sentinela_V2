export class Semaphore {
  private permits: number;
  private waiting: (() => void)[] = [];
  
  constructor(private maxPermits: number) { this.permits = maxPermits; }
  
  async acquire(): Promise<void> {
    if (this.permits > 0) { this.permits--; return; }
    return new Promise(resolve => this.waiting.push(resolve));
  }
  
  release(): void {
    const next = this.waiting.shift();
    if (next) next();
    else this.permits = Math.min(this.permits + 1, this.maxPermits);
  }
  
  async withPermit<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try { return await fn(); }
    finally { this.release(); }
  }
  
  availablePermits(): number { return this.permits; }
  waitingCount(): number { return this.waiting.length; }
}