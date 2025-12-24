export class Semaphore {
  private permits: number;
  private waiting: (() => void)[] = [];
  
  constructor(permits: number) { this.permits = permits; }
  
  async acquire(): Promise<void> {
    if (this.permits > 0) { this.permits--; return; }
    await new Promise<void>(resolve => this.waiting.push(resolve));
  }
  
  release(): void {
    const next = this.waiting.shift();
    if (next) next();
    else this.permits++;
  }
  
  async withPermit<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try { return await fn(); }
    finally { this.release(); }
  }
  
  availablePermits(): number { return this.permits; }
  waitingCount(): number { return this.waiting.length; }
}