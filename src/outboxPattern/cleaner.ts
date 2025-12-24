import { OutboxMessage, OutboxStatus } from './types';

export class OutboxCleaner {
  private messages: Map<string, OutboxMessage>;

  constructor(private retentionDays: number = 7) {
    this.messages = new Map();
  }

  setMessages(messages: Map<string, OutboxMessage>): void {
    this.messages = messages;
  }

  async cleanup(): Promise<CleanupResult> {
    const cutoff = new Date(Date.now() - this.retentionDays * 24 * 60 * 60 * 1000);
    let deleted = 0;

    for (const [id, message] of this.messages) {
      if (message.status === 'published' && message.processedAt && message.processedAt < cutoff) {
        this.messages.delete(id);
        deleted++;
      }
    }

    return { deleted, remaining: this.messages.size };
  }

  async archiveOld(archiver: MessageArchiver): Promise<number> {
    const cutoff = new Date(Date.now() - this.retentionDays * 24 * 60 * 60 * 1000);
    let archived = 0;

    for (const [id, message] of this.messages) {
      if (message.processedAt && message.processedAt < cutoff) {
        await archiver.archive(message);
        this.messages.delete(id);
        archived++;
      }
    }

    return archived;
  }

  getStats(): CleanupStats {
    const messages = Array.from(this.messages.values());
    return {
      total: messages.length,
      pending: messages.filter(m => m.status === 'pending').length,
      published: messages.filter(m => m.status === 'published').length,
      failed: messages.filter(m => m.status === 'failed').length
    };
  }
}

export interface CleanupResult {
  deleted: number;
  remaining: number;
}

export interface CleanupStats {
  total: number;
  pending: number;
  published: number;
  failed: number;
}

export interface MessageArchiver {
  archive(message: OutboxMessage): Promise<void>;
}