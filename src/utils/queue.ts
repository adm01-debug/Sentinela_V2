type Task<T> = () => Promise<T>;

export class AsyncQueue {
  private queue: Array<{ task: Task<unknown>; resolve: (v: number) => void; reject: (e: unknown) => void }> = [];
  private running = 0;
  private concurrency: number;

  constructor(concurrency = 1) { this.concurrency = concurrency; }

  async add<T>(task: Task<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve: resolve as (v: number) => void, reject });
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.running >= this.concurrency || this.queue.length === 0) return;
    this.running++;
    const { task, resolve, reject } = this.queue.shift()!;
    try { resolve(await task()); }
    catch (e) { reject(e); }
    finally { this.running--; this.process(); }
  }

  get size(): number { return this.queue.length; }
  get pending(): number { return this.running; }
}

export function createQueue(concurrency = 1): AsyncQueue {
  return new AsyncQueue(concurrency);
}
