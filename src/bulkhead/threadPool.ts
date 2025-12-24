export class ThreadPool {
  private workers: Worker[] = [];
  private queue: Task[] = [];
  private activeCount: number = 0;
  
  constructor(private maxThreads: number) {}
  
  async submit<T>(task: () => Promise<T>): Promise<T> {
    if (this.activeCount < this.maxThreads) {
      return this.executeTask(task);
    }
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
    });
  }
  
  private async executeTask<T>(task: () => Promise<T>): Promise<T> {
    this.activeCount++;
    try {
      return await task();
    } finally {
      this.activeCount--;
      this.processQueue();
    }
  }
  
  private processQueue(): void {
    if (this.queue.length > 0 && this.activeCount < this.maxThreads) {
      const next = this.queue.shift()!;
      this.executeTask(next.task).then(next.resolve).catch(next.reject);
    }
  }
  
  getActiveCount(): number { return this.activeCount; }
  getQueueSize(): number { return this.queue.length; }
}

interface Task { task: () => Promise<unknown>; resolve: (v: unknown) => void; reject: (e: unknown) => void; }
interface Worker { id: number; busy: boolean; }