import { DeadLetterMessage, DLQConfig } from './types';
import { DeadLetterQueue } from './queue';

export class DLQProcessor {
  private running: boolean = false;
  private timer?: NodeJS.Timeout;
  
  constructor(private dlq: DeadLetterQueue, private config: DLQConfig, private retryHandler: (message: DeadLetterMessage) => Promise<boolean>) {}
  
  start(): void {
    this.running = true;
    this.timer = setInterval(() => this.processMessages(), this.config.retryDelay);
  }
  
  stop(): void { this.running = false; if (this.timer) clearInterval(this.timer); }
  
  private async processMessages(): Promise<void> {
    const messages = await this.dlq.peek(10);
    for (const message of messages) {
      if (message.retryCount >= message.maxRetries) continue;
      try {
        const success = await this.retryHandler(message);
        if (success) { await this.dlq.remove(message.id); }
        else { message.retryCount++; }
      } catch (e) { message.retryCount++; }
    }
  }
  
  async reprocessMessage(id: string): Promise<boolean> {
    const message = await this.dlq.getById(id);
    if (!message) return false;
    try {
      const success = await this.retryHandler(message);
      if (success) await this.dlq.remove(id);
      return success;
    } catch { return false; }
  }
}