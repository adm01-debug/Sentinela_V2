// Outbox Repository
import { OutboxMessage, OutboxStatus } from './types';

export interface OutboxRepository {
  save(message: OutboxMessage): Promise<void>;
  saveBatch(messages: OutboxMessage[]): Promise<void>;
  findPendingMessages(limit: number, lockTimeoutMs: number): Promise<OutboxMessage[]>;
  markAsProcessed(id: string): Promise<void>;
  markAsFailed(id: string, error?: string): Promise<void>;
  markAsDeadLetter(id: string, error?: string): Promise<void>;
  getCounts(): Promise<OutboxCounts>;
  deleteProcessedBefore(date: Date): Promise<number>;
  findById(id: string): Promise<OutboxMessage | null>;
}

export interface OutboxCounts {
  pending: number;
  processing: number;
  processed: number;
  failed: number;
  deadLetter: number;
}

export class InMemoryOutboxRepository implements OutboxRepository {
  private messages: Map<string, OutboxMessage> = new Map();
  private locks: Map<string, number> = new Map();

  async save(message: OutboxMessage): Promise<void> {
    this.messages.set(message.id, { ...message });
  }

  async saveBatch(messages: OutboxMessage[]): Promise<void> {
    for (const message of messages) {
      await this.save(message);
    }
  }

  async findPendingMessages(limit: number, lockTimeoutMs: number): Promise<OutboxMessage[]> {
    const now = Date.now();
    const pending: OutboxMessage[] = [];

    for (const [id, message] of this.messages) {
      if (pending.length >= limit) break;

      const isLocked = this.locks.has(id) && this.locks.get(id)! > now;
      
      if (!isLocked && (message.status === OutboxStatus.Pending || message.status === OutboxStatus.Failed)) {
        this.locks.set(id, now + lockTimeoutMs);
        message.status = OutboxStatus.Processing;
        pending.push({ ...message });
      }
    }

    return pending;
  }

  async markAsProcessed(id: string): Promise<void> {
    const message = this.messages.get(id);
    if (message) {
      message.status = OutboxStatus.Processed;
      message.processedAt = new Date();
    }
    this.locks.delete(id);
  }

  async markAsFailed(id: string, error?: string): Promise<void> {
    const message = this.messages.get(id);
    if (message) {
      message.status = OutboxStatus.Failed;
      message.retryCount++;
      message.lastError = error;
    }
    this.locks.delete(id);
  }

  async markAsDeadLetter(id: string, error?: string): Promise<void> {
    const message = this.messages.get(id);
    if (message) {
      message.status = OutboxStatus.DeadLetter;
      message.lastError = error;
    }
    this.locks.delete(id);
  }

  async getCounts(): Promise<OutboxCounts> {
    const counts: OutboxCounts = {
      pending: 0,
      processing: 0,
      processed: 0,
      failed: 0,
      deadLetter: 0
    };

    for (const message of this.messages.values()) {
      switch (message.status) {
        case OutboxStatus.Pending: counts.pending++; break;
        case OutboxStatus.Processing: counts.processing++; break;
        case OutboxStatus.Processed: counts.processed++; break;
        case OutboxStatus.Failed: counts.failed++; break;
        case OutboxStatus.DeadLetter: counts.deadLetter++; break;
      }
    }

    return counts;
  }

  async deleteProcessedBefore(date: Date): Promise<number> {
    let deleted = 0;
    for (const [id, message] of this.messages) {
      if (message.status === OutboxStatus.Processed && message.processedAt && message.processedAt < date) {
        this.messages.delete(id);
        deleted++;
      }
    }
    return deleted;
  }

  async findById(id: string): Promise<OutboxMessage | null> {
    return this.messages.get(id) ?? null;
  }
}
