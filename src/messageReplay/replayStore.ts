import { ReplayConfig, StoredMessage } from './types';

export interface ReplayStore {
  getMessages(config: ReplayConfig): Promise<StoredMessage[]>;
  getMessage(offset: number): Promise<StoredMessage | null>;
  getLatestOffset(): Promise<number>;
  getEarliestOffset(): Promise<number>;
}

export class InMemoryReplayStore implements ReplayStore {
  private messages: StoredMessage[] = [];
  
  async store(message: StoredMessage): Promise<void> { this.messages.push(message); }
  
  async getMessages(config: ReplayConfig): Promise<StoredMessage[]> {
    return this.messages.filter(m => {
      if (config.fromTimestamp && m.timestamp < config.fromTimestamp) return false;
      if (config.toTimestamp && m.timestamp > config.toTimestamp) return false;
      if (config.fromOffset && m.offset < config.fromOffset) return false;
      if (config.toOffset && m.offset > config.toOffset) return false;
      if (config.filter?.eventTypes && !config.filter.eventTypes.includes(m.eventType)) return false;
      if (config.filter?.aggregateIds && !config.filter.aggregateIds.includes(m.aggregateId)) return false;
      return true;
    });
  }
  
  async getMessage(offset: number): Promise<StoredMessage | null> { return this.messages.find(m => m.offset === offset) ?? null; }
  async getLatestOffset(): Promise<number> { return this.messages.length > 0 ? Math.max(...this.messages.map(m => m.offset)) : 0; }
  async getEarliestOffset(): Promise<number> { return this.messages.length > 0 ? Math.min(...this.messages.map(m => m.offset)) : 0; }
}