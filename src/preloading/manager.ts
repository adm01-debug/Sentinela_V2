import { PreloadResource, PreloadConfig } from './types';

export class PreloadManager {
  private queue: PreloadResource[] = [];
  private loading: Set<string> = new Set();
  private loaded: Set<string> = new Set();
  
  constructor(private config: PreloadConfig) {}
  
  add(resource: PreloadResource): void {
    if (this.loaded.has(resource.url) || this.loading.has(resource.url)) return;
    this.queue.push(resource);
    this.queue.sort((a, b) => (a.priority === 'high' ? -1 : 1) - (b.priority === 'high' ? -1 : 1));
    this.processQueue();
  }
  
  private processQueue(): void {
    while (this.loading.size < this.config.maxConcurrent && this.queue.length > 0) {
      const resource = this.queue.shift()!;
      this.load(resource);
    }
  }
  
  private async load(resource: PreloadResource): Promise<void> {
    this.loading.add(resource.url);
    await new Promise(r => setTimeout(r, 50));
    this.loading.delete(resource.url);
    this.loaded.add(resource.url);
    this.processQueue();
  }
  
  getStatus(): { queued: number; loading: number; loaded: number } {
    return { queued: this.queue.length, loading: this.loading.size, loaded: this.loaded.size };
  }
}