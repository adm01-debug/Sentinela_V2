import { DeadLetterMessage, DLQConfig, DLQStats } from './types';
import { v4 as uuidv4 } from 'uuid';

export class DeadLetterQueue {
  private messages: DeadLetterMessage[] = [];
  private listeners: Array<(message: DeadLetterMessage) => void> = [];
  
  constructor(private config: DLQConfig) {}
  
  async enqueue(originalQueue: string, payload: unknown, error: string, metadata?: Record<string, string>): Promise<DeadLetterMessage> {
    const message: DeadLetterMessage = {
      id: uuidv4(), originalQueue, payload, error, retryCount: 0, maxRetries: this.config.maxRetries,
      failedAt: new Date(), metadata: metadata ?? {}
    };
    this.messages.push(message);
    this.listeners.forEach(l => l(message));
    if (this.messages.length >= this.config.alertThreshold) console.warn('DLQ threshold reached:', this.messages.length);
    return message;
  }
  
  async dequeue(): Promise<DeadLetterMessage | null> { return this.messages.shift() ?? null; }
  async peek(count: number = 10): Promise<DeadLetterMessage[]> { return this.messages.slice(0, count); }
  async getById(id: string): Promise<DeadLetterMessage | null> { return this.messages.find(m => m.id === id) ?? null; }
  async remove(id: string): Promise<boolean> { const idx = this.messages.findIndex(m => m.id === id); if (idx > -1) { this.messages.splice(idx, 1); return true; } return false; }
  
  async getStats(): Promise<DLQStats> {
    const byQueue: Record<string, number> = {};
    const byError: Record<string, number> = {};
    this.messages.forEach(m => { byQueue[m.originalQueue] = (byQueue[m.originalQueue] ?? 0) + 1; byError[m.error] = (byError[m.error] ?? 0) + 1; });
    return {
      totalMessages: this.messages.length, byQueue, byError,
      oldestMessage: this.messages[0]?.failedAt, newestMessage: this.messages[this.messages.length - 1]?.failedAt
    };
  }
  
  onMessage(listener: (message: DeadLetterMessage) => void): void { this.listeners.push(listener); }
}