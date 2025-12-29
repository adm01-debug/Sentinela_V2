interface SyncItem<T = unknown> {
  id: string;
  data: T;
  timestamp: Date;
  retries: number;
  maxRetries: number;
}

interface BackgroundSyncConfig {
  maxRetries: number;
  retryDelay: number;
  maxQueueSize: number;
}

class BackgroundSync<T = unknown> {
  private queue: SyncItem<T>[] = [];
  private config: BackgroundSyncConfig;
  private isProcessing = false;
  private syncHandler: ((data: T) => Promise<boolean>) | null = null;

  constructor(config?: Partial<BackgroundSyncConfig>) {
    this.config = {
      maxRetries: 3,
      retryDelay: 5000,
      maxQueueSize: 1000,
      ...config,
    };
  }

  setSyncHandler(handler: (data: T) => Promise<boolean>): void {
    this.syncHandler = handler;
  }

  enqueue(data: T): string {
    if (this.queue.length >= this.config.maxQueueSize) {
      throw new Error('Queue is full');
    }

    const id = crypto.randomUUID();
    const item: SyncItem<T> = {
      id,
      data,
      timestamp: new Date(),
      retries: 0,
      maxRetries: this.config.maxRetries,
    };

    this.queue.push(item);
    this.processQueue();

    return id;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || !this.syncHandler || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue[0];

      try {
        const success = await this.syncHandler(item.data);
        
        if (success) {
          this.queue.shift();
        } else {
          await this.handleRetry(item);
        }
      } catch (error) {
        await this.handleRetry(item);
      }
    }

    this.isProcessing = false;
  }

  private async handleRetry(item: SyncItem<T>): Promise<void> {
    item.retries++;
    
    if (item.retries >= item.maxRetries) {
      this.queue.shift(); // Remove failed item
      return;
    }

    // Move to end of queue
    this.queue.shift();
    this.queue.push(item);
    
    await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  clearQueue(): void {
    this.queue = [];
  }
}

export const backgroundSync = new BackgroundSync();
export type { SyncItem, BackgroundSyncConfig };
