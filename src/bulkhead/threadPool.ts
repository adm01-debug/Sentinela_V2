export class ThreadPool {
  private queue: (() => Promise<void>)[] = [];
  private running: number = 0;
  
  constructor(private maxThreads: number) {}
  
  async submit<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const wrappedTask = async () => {
        try { resolve(await task()); }
        catch (e) { reject(e); }
        finally { this.running--; this.processQueue(); }
      };
      
      if (this.running < this.maxThreads) {
        this.running++;
        wrappedTask();
      } else {
        this.queue.push(wrappedTask);
      }
    });
  }
  
  private processQueue(): void {
    while (this.running < this.maxThreads && this.queue.length > 0) {
      const task = this.queue.shift()!;
      this.running++;
      task();
    }
  }
  
  getStats(): { running: number; queued: number; available: number } {
    return { running: this.running, queued: this.queue.length, available: this.maxThreads - this.running };
  }
}