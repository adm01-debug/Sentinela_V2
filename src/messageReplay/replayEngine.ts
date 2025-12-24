import { ReplayMessage, ReplayConfig, ReplayStatus } from './types';

export class ReplayEngine {
  private status: ReplayStatus = { status: 'idle', messagesReplayed: 0, currentPosition: 0, totalMessages: 0 };
  private messages: ReplayMessage[] = [];
  private handler?: (msg: ReplayMessage) => Promise<void>;
  
  setMessages(messages: ReplayMessage[]): void { this.messages = messages; this.status.totalMessages = messages.length; }
  setHandler(handler: (msg: ReplayMessage) => Promise<void>): void { this.handler = handler; }
  
  async start(config: ReplayConfig): Promise<void> {
    this.status.status = 'running';
    const filtered = this.filterMessages(config);
    for (let i = 0; i < filtered.length && this.status.status === 'running'; i += config.batchSize) {
      const batch = filtered.slice(i, i + config.batchSize);
      for (const msg of batch) {
        if (this.handler) await this.handler(msg);
        this.status.messagesReplayed++;
        this.status.currentPosition = i;
      }
      await this.delay(1000 / config.speed);
    }
    this.status.status = 'completed';
  }
  
  pause(): void { this.status.status = 'paused'; }
  resume(): void { this.status.status = 'running'; }
  getStatus(): ReplayStatus { return { ...this.status }; }
  
  private filterMessages(config: ReplayConfig): ReplayMessage[] {
    return this.messages.filter(m => {
      if (config.fromTimestamp && m.timestamp < config.fromTimestamp) return false;
      if (config.toTimestamp && m.timestamp > config.toTimestamp) return false;
      if (config.topics && !config.topics.includes(m.topic)) return false;
      return true;
    });
  }
  
  private delay(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
}