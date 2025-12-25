/**
 * @fileoverview Batch processor
 * @module @sentinela/core/batch
 */
export interface BatchConfig { maxSize: number; maxWait: number; }
export class BatchProcessor<T, R> {
  private batch: T[] = [];
  private timer: NodeJS.Timeout | null = null;
  constructor(private processor: (items: T[]) => Promise<R[]>, private config: BatchConfig) {}
  async add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.batch.push(item);
      if (this.batch.length >= this.config.maxSize) this.flush().then(results => resolve(results[results.length - 1])).catch(reject);
      else if (!this.timer) {
        this.timer = setTimeout(() => this.flush().then(results => resolve(results[results.length - 1])).catch(reject), this.config.maxWait);
      }
    });
  }
  async flush(): Promise<R[]> {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    const items = this.batch; this.batch = [];
    return this.processor(items);
  }
}
