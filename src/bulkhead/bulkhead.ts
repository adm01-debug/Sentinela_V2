// Bulkhead Pattern - Isolation
export interface BulkheadConfig { maxConcurrent: number; maxQueue: number; timeout: number; }
export class Bulkhead {
  private active = 0; private queue: (() => void)[] = [];
  constructor(private config: BulkheadConfig) {}
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.active >= this.config.maxConcurrent) {
      if (this.queue.length >= this.config.maxQueue) throw new Error("Bulkhead queue full");
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Bulkhead timeout")), this.config.timeout);
        this.queue.push(() => { clearTimeout(timeout); resolve(); });
      });
    }
    this.active++;
    try { return await fn(); } finally { this.active--; if (this.queue.length > 0) this.queue.shift()?.(); }
  }
  getStats() { return { active: this.active, queued: this.queue.length }; }
}
