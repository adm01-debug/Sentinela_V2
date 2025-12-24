import { BulkheadConfig, BulkheadMetrics } from './types';

export class Bulkhead {
  private activeCount: number = 0;
  private queue: Array<{ resolve: () => void; reject: (e: Error) => void; timestamp: number }> = [];
  private metrics: BulkheadMetrics = { activeCount: 0, queuedCount: 0, completedCount: 0, rejectedCount: 0, averageWaitTime: 0 };
  
  constructor(private config: BulkheadConfig) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try { const result = await fn(); this.metrics.completedCount++; return result; }
    finally { this.release(); }
  }
  
  private acquire(): Promise<void> {
    if (this.activeCount < this.config.maxConcurrent) {
      this.activeCount++; this.metrics.activeCount = this.activeCount;
      return Promise.resolve();
    }
    if (this.queue.length >= this.config.maxWait) {
      this.metrics.rejectedCount++;
      return Promise.reject(new Error('Bulkhead queue full'));
    }
    return new Promise((resolve, reject) => {
      const timestamp = Date.now();
      this.queue.push({ resolve, reject, timestamp });
      this.metrics.queuedCount = this.queue.length;
      setTimeout(() => {
        const idx = this.queue.findIndex(q => q.resolve === resolve);
        if (idx !== -1) { this.queue.splice(idx, 1); reject(new Error('Bulkhead timeout')); }
      }, this.config.timeout);
    });
  }
  
  private release(): void {
    this.activeCount--;
    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      this.activeCount++;
      this.metrics.averageWaitTime = (this.metrics.averageWaitTime + (Date.now() - next.timestamp)) / 2;
      next.resolve();
    }
    this.metrics.activeCount = this.activeCount;
    this.metrics.queuedCount = this.queue.length;
  }
  
  getMetrics(): BulkheadMetrics { return { ...this.metrics }; }
}