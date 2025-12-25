/**
 * @fileoverview Bulkhead pattern implementation
 * @module @sentinela/core/bulkhead
 * @version 13.0.0
 */

export interface BulkheadConfig {
  maxConcurrent: number;
  maxQueue?: number;
  timeout?: number;
}

export class Bulkhead {
  private running = 0;
  private queue: Array<{
    fn: () => Promise<unknown>;
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
  }> = [];

  constructor(private config: BulkheadConfig) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.running < this.config.maxConcurrent) {
      return this.run(fn);
    }

    const maxQueue = this.config.maxQueue ?? 100;
    if (this.queue.length >= maxQueue) {
      throw new Error('Bulkhead queue full');
    }

    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve: resolve as any, reject });
    });
  }

  private async run<T>(fn: () => Promise<T>): Promise<T> {
    this.running++;
    try {
      return await fn();
    } finally {
      this.running--;
      this.processQueue();
    }
  }

  private processQueue(): void {
    if (this.queue.length > 0 && this.running < this.config.maxConcurrent) {
      const item = this.queue.shift()!;
      this.run(item.fn).then(item.resolve).catch(item.reject);
    }
  }

  get stats(): { running: number; queued: number } {
    return { running: this.running, queued: this.queue.length };
  }
}
