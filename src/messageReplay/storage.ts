import { ReplayMessage } from './types';

export class ReplayStorage {
  private messages: Map<string, ReplayMessage> = new Map();
  
  store(message: ReplayMessage): void { this.messages.set(message.id, message); }
  get(id: string): ReplayMessage | undefined { return this.messages.get(id); }
  
  getByTimeRange(from: Date, to: Date): ReplayMessage[] {
    return Array.from(this.messages.values()).filter(m => m.timestamp >= from && m.timestamp <= to);
  }
  
  getByTopic(topic: string): ReplayMessage[] {
    return Array.from(this.messages.values()).filter(m => m.topic === topic);
  }
  
  size(): number { return this.messages.size; }
  clear(): void { this.messages.clear(); }
}