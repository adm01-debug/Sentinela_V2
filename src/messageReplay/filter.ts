import { ReplayMessage } from './types';

export class MessageFilter {
  private filters: ((msg: ReplayMessage) => boolean)[] = [];
  
  byTopic(topic: string): this { this.filters.push(m => m.topic === topic); return this; }
  byTimeRange(from: Date, to: Date): this { this.filters.push(m => m.timestamp >= from && m.timestamp <= to); return this; }
  byMetadata(key: string, value: string): this { this.filters.push(m => m.metadata[key] === value); return this; }
  custom(predicate: (msg: ReplayMessage) => boolean): this { this.filters.push(predicate); return this; }
  
  apply(messages: ReplayMessage[]): ReplayMessage[] {
    return messages.filter(m => this.filters.every(f => f(m)));
  }
  
  reset(): void { this.filters = []; }
}