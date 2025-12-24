import { ReplayConfig, ReplayProgress, StoredMessage, ReplayStatus } from './types';
import { ReplayStore } from './replayStore';

export class ReplayEngine {
  private status: ReplayStatus = 'pending';
  private progress: ReplayProgress = { totalMessages: 0, processedMessages: 0, currentOffset: 0, startedAt: new Date(), status: 'pending' };
  private handlers: Array<(message: StoredMessage) => Promise<void>> = [];
  
  constructor(private store: ReplayStore, private config: ReplayConfig) {}
  
  onMessage(handler: (message: StoredMessage) => Promise<void>): void { this.handlers.push(handler); }
  
  async start(): Promise<void> {
    this.status = 'running';
    this.progress.startedAt = new Date();
    this.progress.status = 'running';
    const messages = await this.store.getMessages(this.config);
    this.progress.totalMessages = messages.length;
    
    for (const message of messages) {
      if (this.status !== 'running') break;
      await this.processMessage(message);
      if (this.config.speedFactor < 1) await this.delay(100 / this.config.speedFactor);
    }
    
    if (this.status === 'running') { this.status = 'completed'; this.progress.status = 'completed'; }
  }
  
  pause(): void { this.status = 'paused'; this.progress.status = 'paused'; }
  resume(): void { if (this.status === 'paused') { this.status = 'running'; this.progress.status = 'running'; } }
  stop(): void { this.status = 'completed'; this.progress.status = 'completed'; }
  
  private async processMessage(message: StoredMessage): Promise<void> {
    await Promise.all(this.handlers.map(h => h(message)));
    this.progress.processedMessages++;
    this.progress.currentOffset = message.offset;
  }
  
  private delay(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
  getProgress(): ReplayProgress { return { ...this.progress }; }
}