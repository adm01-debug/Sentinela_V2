// Thread Pool Simulation
export class ThreadPool {
  private workers: number = 0; private queue: (() => Promise<void>)[] = [];
  constructor(private size: number) {}
  async submit<T>(task: () => Promise<T>): Promise<T> {
    if (this.workers < this.size) { this.workers++; try { return await task(); } finally { this.workers--; this.runNext(); } }
    return new Promise((resolve, reject) => { this.queue.push(async () => { try { resolve(await task()); } catch (e) { reject(e); } }); });
  }
  private async runNext() { if (this.queue.length > 0 && this.workers < this.size) { this.workers++; const task = this.queue.shift()!; await task(); this.workers--; this.runNext(); } }
  getStats() { return { workers: this.workers, queued: this.queue.length }; }
}
