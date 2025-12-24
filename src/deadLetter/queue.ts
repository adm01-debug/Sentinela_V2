import { DeadLetterMessage, DLQConfig } from './types';
import { v4 as uuidv4 } from 'uuid';

export class DeadLetterQueue {
  private messages: DeadLetterMessage[] = [];
  
  constructor(private config: DLQConfig) {}
  
  add(originalTopic: string, payload: unknown, error: string, metadata?: Record<string, string>): DeadLetterMessage {
    const msg: DeadLetterMessage = {
      id: uuidv4(), originalTopic, payload, error, failedAt: new Date(), retryCount: 0, metadata: metadata ?? {}
    };
    this.messages.push(msg);
    return msg;
  }
  
  get(id: string): DeadLetterMessage | undefined { return this.messages.find(m => m.id === id); }
  getAll(): DeadLetterMessage[] { return [...this.messages]; }
  getByTopic(topic: string): DeadLetterMessage[] { return this.messages.filter(m => m.originalTopic === topic); }
  
  remove(id: string): boolean {
    const index = this.messages.findIndex(m => m.id === id);
    if (index >= 0) { this.messages.splice(index, 1); return true; }
    return false;
  }
  
  incrementRetry(id: string): void {
    const msg = this.get(id);
    if (msg) msg.retryCount++;
  }
  
  size(): number { return this.messages.length; }
  
  purgeExpired(): number {
    const now = Date.now();
    const before = this.messages.length;
    this.messages = this.messages.filter(m => now - m.failedAt.getTime() < this.config.ttl);
    return before - this.messages.length;
  }
}