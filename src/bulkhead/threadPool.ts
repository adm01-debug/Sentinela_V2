export class ThreadPoolBulkhead {
  private workers: Worker[] = [];
  private taskQueue: Array<{ task: () => Promise<unknown>; resolve: (v: unknown) => void; reject: (e: Error) => void }> = [];
  private busyWorkers: Set<number> = new Set();
  
  constructor(private poolSize: number) {
    for (let i = 0; i < poolSize; i++) this.workers.push({ id: i } as Worker);
  }
  
  async submit<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ task: task as () => Promise<unknown>, resolve: resolve as (v: unknown) => void, reject });
      this.processQueue();
    });
  }
  
  private async processQueue(): Promise<void> {
    const availableWorker = this.workers.findIndex((_, i) => !this.busyWorkers.has(i));
    if (availableWorker === -1 || this.taskQueue.length === 0) return;
    const { task, resolve, reject } = this.taskQueue.shift()!;
    this.busyWorkers.add(availableWorker);
    try { resolve(await task()); }
    catch (e) { reject(e as Error); }
    finally { this.busyWorkers.delete(availableWorker); this.processQueue(); }
  }
  
  getPoolStatus(): { total: number; busy: number; idle: number; queued: number } {
    return { total: this.poolSize, busy: this.busyWorkers.size, idle: this.poolSize - this.busyWorkers.size, queued: this.taskQueue.length };
  }
}

interface Worker { id: number; }