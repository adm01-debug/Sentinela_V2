import { PrefetchConfig, PrefetchRequest, PrefetchResult } from './types';

export class Prefetcher {
  private queue: PrefetchRequest[] = [];
  private results: Map<string, PrefetchResult> = new Map();
  private active: number = 0;
  
  constructor(private config: PrefetchConfig) {}
  
  prefetch(url: string, priority: number = 0): void {
    if (this.results.has(url)) return;
    this.queue.push({ url, priority, timestamp: new Date() });
    this.queue.sort((a, b) => b.priority - a.priority);
    this.processQueue();
  }
  
  private async processQueue(): Promise<void> {
    while (this.active < this.config.maxPrefetches && this.queue.length > 0) {
      const request = this.queue.shift()!;
      this.active++;
      const start = Date.now();
      
      try {
        await new Promise(r => setTimeout(r, 50));
        this.results.set(request.url, { url: request.url, success: true, duration: Date.now() - start });
      } catch {
        this.results.set(request.url, { url: request.url, success: false });
      }
      
      this.active--;
      this.processQueue();
    }
  }
  
  getResult(url: string): PrefetchResult | undefined { return this.results.get(url); }
  getStats(): { queued: number; completed: number; success: number } {
    const results = Array.from(this.results.values());
    return { queued: this.queue.length, completed: results.length, success: results.filter(r => r.success).length };
  }
}