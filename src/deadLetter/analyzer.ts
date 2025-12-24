import { DeadLetterMessage, DLQStats } from './types';
import { DeadLetterQueue } from './queue';

export class DLQAnalyzer {
  constructor(private dlq: DeadLetterQueue) {}
  
  async getTopErrors(limit: number = 10): Promise<Array<{ error: string; count: number }>> {
    const stats = await this.dlq.getStats();
    return Object.entries(stats.byError).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([error, count]) => ({ error, count }));
  }
  
  async getAffectedQueues(): Promise<Array<{ queue: string; count: number }>> {
    const stats = await this.dlq.getStats();
    return Object.entries(stats.byQueue).sort((a, b) => b[1] - a[1]).map(([queue, count]) => ({ queue, count }));
  }
  
  async getMessagesByTimeRange(from: Date, to: Date): Promise<DeadLetterMessage[]> {
    const messages = await this.dlq.peek(1000);
    return messages.filter(m => m.failedAt >= from && m.failedAt <= to);
  }
  
  async generateReport(): Promise<DLQReport> {
    const stats = await this.dlq.getStats();
    return { stats, topErrors: await this.getTopErrors(), affectedQueues: await this.getAffectedQueues(), generatedAt: new Date() };
  }
}

export interface DLQReport { stats: DLQStats; topErrors: Array<{ error: string; count: number }>; affectedQueues: Array<{ queue: string; count: number }>; generatedAt: Date; }