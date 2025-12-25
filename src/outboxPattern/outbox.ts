/**
 * @fileoverview Outbox implementation
 * @module @sentinela/core/outboxPattern
 * @version 13.0.0
 */

import { OutboxMessage, OutboxEntry, OutboxStatus, OutboxConfig } from './types';
import { v4 as uuidv4 } from 'uuid';

export class Outbox {
  private messages: Map<string, OutboxMessage> = new Map();
  private config: OutboxConfig;

  constructor(config?: Partial<OutboxConfig>) {
    this.config = {
      tableName: 'outbox',
      batchSize: 100,
      retryLimit: 3,
      retryDelayMs: 1000,
      cleanupAfterDays: 7,
      ...config
    };
  }

  async add(entry: OutboxEntry): Promise<OutboxMessage> {
    const message: OutboxMessage = {
      id: uuidv4(),
      ...entry,
      status: 'pending',
      createdAt: new Date(),
      retries: 0
    };
    this.messages.set(message.id, message);
    return message;
  }

  async addBatch(entries: OutboxEntry[]): Promise<OutboxMessage[]> {
    return Promise.all(entries.map(e => this.add(e)));
  }

  async getPending(limit?: number): Promise<OutboxMessage[]> {
    const pending = Array.from(this.messages.values())
      .filter(m => m.status === 'pending')
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    return pending.slice(0, limit ?? this.config.batchSize);
  }

  async markProcessing(id: string): Promise<void> {
    const message = this.messages.get(id);
    if (message) message.status = 'processing';
  }

  async markPublished(id: string): Promise<void> {
    const message = this.messages.get(id);
    if (message) {
      message.status = 'published';
      message.processedAt = new Date();
    }
  }

  async markFailed(id: string, error: string): Promise<void> {
    const message = this.messages.get(id);
    if (message) {
      message.retries++;
      message.error = error;
      message.status = message.retries >= this.config.retryLimit ? 'failed' : 'pending';
    }
  }

  async getByAggregate(aggregateType: string, aggregateId: string): Promise<OutboxMessage[]> {
    return Array.from(this.messages.values())
      .filter(m => m.aggregateType === aggregateType && m.aggregateId === aggregateId);
  }
}