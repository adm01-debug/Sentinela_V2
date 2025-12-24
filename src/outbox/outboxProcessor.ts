// Outbox Processor
import { OutboxMessage, OutboxStatus, OutboxConfig, DEFAULT_OUTBOX_CONFIG, MessagePublisher, OutboxStats } from './types';
import { OutboxRepository } from './outboxRepository';
import { v4 as uuidv4 } from 'uuid';

export class OutboxProcessor {
  private config: OutboxConfig;
  private repository: OutboxRepository;
  private publisher: MessagePublisher;
  private isRunning: boolean = false;
  private timer?: NodeJS.Timeout;
  private processedCount: number = 0;
  private startTime: number = 0;

  constructor(
    repository: OutboxRepository,
    publisher: MessagePublisher,
    config: Partial<OutboxConfig> = {}
  ) {
    this.repository = repository;
    this.publisher = publisher;
    this.config = { ...DEFAULT_OUTBOX_CONFIG, ...config };
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startTime = Date.now();
    this.poll();
  }

  stop(): void {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  private async poll(): Promise<void> {
    if (!this.isRunning) return;

    try {
      await this.processMessages();
    } catch (error) {
      console.error('Outbox processing error:', error);
    }

    this.timer = setTimeout(() => this.poll(), this.config.pollIntervalMs);
  }

  private async processMessages(): Promise<void> {
    const messages = await this.repository.findPendingMessages(
      this.config.batchSize,
      this.config.lockTimeoutMs
    );

    if (messages.length === 0) return;

    const results = await this.publisher.publishBatch(messages);

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const message = messages[i];

      if (result.success) {
        await this.repository.markAsProcessed(message.id);
        this.processedCount++;
      } else {
        if (message.retryCount >= this.config.maxRetries) {
          await this.repository.markAsDeadLetter(message.id, result.error);
        } else {
          await this.repository.markAsFailed(message.id, result.error);
        }
      }
    }
  }

  async getStats(): Promise<OutboxStats> {
    const counts = await this.repository.getCounts();
    const elapsedSeconds = (Date.now() - this.startTime) / 1000;

    return {
      ...counts,
      avgProcessingTimeMs: 0,
      messagesPerSecond: elapsedSeconds > 0 ? this.processedCount / elapsedSeconds : 0
    };
  }

  async cleanup(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.cleanupAfterDays);
    return this.repository.deleteProcessedBefore(cutoffDate);
  }
}

export class OutboxMessageBuilder {
  private message: Partial<OutboxMessage> = {
    id: uuidv4(),
    status: OutboxStatus.Pending,
    createdAt: new Date(),
    retryCount: 0,
    metadata: {
      correlationId: uuidv4()
    }
  };

  static create(): OutboxMessageBuilder {
    return new OutboxMessageBuilder();
  }

  withAggregateId(id: string): this {
    this.message.aggregateId = id;
    return this;
  }

  withAggregateType(type: string): this {
    this.message.aggregateType = type;
    return this;
  }

  withEventType(type: string): this {
    this.message.eventType = type;
    return this;
  }

  withPayload(payload: unknown): this {
    this.message.payload = payload;
    return this;
  }

  withCorrelationId(id: string): this {
    this.message.metadata!.correlationId = id;
    return this;
  }

  withDestination(destination: string): this {
    this.message.metadata!.destination = destination;
    return this;
  }

  withHeader(key: string, value: string): this {
    if (!this.message.metadata!.headers) {
      this.message.metadata!.headers = {};
    }
    this.message.metadata!.headers[key] = value;
    return this;
  }

  build(): OutboxMessage {
    if (!this.message.aggregateId || !this.message.aggregateType || !this.message.eventType) {
      throw new Error('Missing required fields');
    }
    return this.message as OutboxMessage;
  }
}
