// Outbox Repository - Persistence Layer
import { OutboxMessage, OutboxStatus } from "./outboxMessage";

export interface OutboxRepository {
  save(message: OutboxMessage): Promise<void>;
  saveMany(messages: OutboxMessage[]): Promise<void>;
  findPending(limit?: number): Promise<OutboxMessage[]>;
  findById(id: string): Promise<OutboxMessage | null>;
  markAsProcessing(id: string): Promise<boolean>;
  markAsProcessed(id: string): Promise<void>;
  markAsFailed(id: string, error: string): Promise<void>;
  moveToDeadLetter(id: string): Promise<void>;
  deleteProcessed(olderThan: Date): Promise<number>;
}

export class InMemoryOutboxRepository implements OutboxRepository {
  private messages: Map<string, OutboxMessage> = new Map();

  async save(message: OutboxMessage): Promise<void> {
    this.messages.set(message.id, { ...message });
  }

  async saveMany(messages: OutboxMessage[]): Promise<void> {
    for (const msg of messages) await this.save(msg);
  }

  async findPending(limit: number = 100): Promise<OutboxMessage[]> {
    return Array.from(this.messages.values())
      .filter(m => m.status === "pending")
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(0, limit);
  }

  async findById(id: string): Promise<OutboxMessage | null> {
    return this.messages.get(id) || null;
  }

  async markAsProcessing(id: string): Promise<boolean> {
    const msg = this.messages.get(id);
    if (!msg || msg.status !== "pending") return false;
    msg.status = "processing";
    return true;
  }

  async markAsProcessed(id: string): Promise<void> {
    const msg = this.messages.get(id);
    if (msg) { msg.status = "processed"; msg.processedAt = new Date(); }
  }

  async markAsFailed(id: string, error: string): Promise<void> {
    const msg = this.messages.get(id);
    if (msg) { msg.status = "failed"; msg.retryCount++; msg.lastError = error; }
  }

  async moveToDeadLetter(id: string): Promise<void> {
    const msg = this.messages.get(id);
    if (msg) msg.status = "dead_letter";
  }

  async deleteProcessed(olderThan: Date): Promise<number> {
    let count = 0;
    for (const [id, msg] of this.messages) {
      if (msg.status === "processed" && msg.processedAt && msg.processedAt < olderThan) {
        this.messages.delete(id);
        count++;
      }
    }
    return count;
  }
}
