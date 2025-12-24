import { DeadLetterMessage, DLQConfig } from './types';
import { DeadLetterQueue } from './queue';

export class DLQProcessor {
  constructor(private queue: DeadLetterQueue, private config: DLQConfig, private retryHandler: (msg: DeadLetterMessage) => Promise<boolean>) {}
  
  async processOne(id: string): Promise<ProcessResult> {
    const msg = this.queue.get(id);
    if (!msg) return { success: false, reason: 'Message not found' };
    if (msg.retryCount >= this.config.maxRetries) return { success: false, reason: 'Max retries exceeded' };
    
    try {
      const success = await this.retryHandler(msg);
      if (success) { this.queue.remove(id); return { success: true }; }
      this.queue.incrementRetry(id);
      return { success: false, reason: 'Retry failed' };
    } catch (e) {
      this.queue.incrementRetry(id);
      return { success: false, reason: (e as Error).message };
    }
  }
  
  async processAll(): Promise<BatchProcessResult> {
    const results: BatchProcessResult = { processed: 0, succeeded: 0, failed: 0 };
    for (const msg of this.queue.getAll()) {
      if (msg.retryCount < this.config.maxRetries) {
        const result = await this.processOne(msg.id);
        results.processed++;
        if (result.success) results.succeeded++;
        else results.failed++;
        await this.delay(this.config.retryDelay);
      }
    }
    return results;
  }
  
  private delay(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
}

export interface ProcessResult { success: boolean; reason?: string; }
export interface BatchProcessResult { processed: number; succeeded: number; failed: number; }