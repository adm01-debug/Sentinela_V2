export class Semaphore {
  private permits: number;
  private waiting: Array<() => void> = [];
  
  constructor(permits: number) { this.permits = permits; }
  
  async acquire(): Promise<void> {
    if (this.permits > 0) { this.permits--; return; }
    return new Promise(resolve => this.waiting.push(resolve));
  }
  
  release(): void {
    if (this.waiting.length > 0) { this.waiting.shift()!(); }
    else { this.permits++; }
  }
  
  async withPermit<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try { return await fn(); }
    finally { this.release(); }
  }
  
  availablePermits(): number { return this.permits; }
  queueLength(): number { return this.waiting.length; }
}