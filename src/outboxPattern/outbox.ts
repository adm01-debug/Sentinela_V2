/**
 * @fileoverview Outbox pattern implementation
 * @module @sentinela/core/outboxPattern
 * @version 13.0.0
 */

export interface OutboxMessage {
  id: string;
  type: string;
  payload: unknown;
  createdAt: Date;
  processedAt?: Date;
  retries: number;
  error?: string;
}

export interface OutboxConfig {
  tableName?: string;
  maxRetries?: number;
  retryDelayMs?: number;
}

export class Outbox {
  private messages: OutboxMessage[] = [];
  private idCounter = 0;

  constructor(private readonly config: OutboxConfig = {}) {}

  async add(message: { type: string; payload: unknown }): Promise<string> {
    const id = String(++this.idCounter);
    this.messages.push({
      id,
      type: message.type,
      payload: message.payload,
      createdAt: new Date(),
      retries: 0
    });
    return id;
  }

  async getPending(): Promise<OutboxMessage[]> {
    const maxRetries = this.config.maxRetries ?? 3;
    return this.messages.filter(m => !m.processedAt && m.retries < maxRetries);
  }

  async markProcessed(id: string): Promise<void> {
    const msg = this.messages.find(m => m.id === id);
    if (msg) msg.processedAt = new Date();
  }

  async markFailed(id: string, error: string): Promise<void> {
    const msg = this.messages.find(m => m.id === id);
    if (msg) {
      msg.retries++;
      msg.error = error;
    }
  }

  clear(): void {
    this.messages = [];
    this.idCounter = 0;
  }
}

export class OutboxProcessor {
  constructor(
    private readonly outbox: Outbox,
    private readonly publisher: { publish: (msg: OutboxMessage) => Promise<void> }
  ) {}

  async process(): Promise<number> {
    const pending = await this.outbox.getPending();
    let processed = 0;
    for (const msg of pending) {
      try {
        await this.publisher.publish(msg);
        await this.outbox.markProcessed(msg.id);
        processed++;
      } catch (error) {
        await this.outbox.markFailed(msg.id, String(error));
      }
    }
    return processed;
  }
}
