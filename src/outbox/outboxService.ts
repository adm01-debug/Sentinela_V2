// Outbox Service - High-Level API
import { OutboxMessage, OutboxMessageBuilder, OutboxMetadata } from "./outboxMessage";
import { OutboxRepository, InMemoryOutboxRepository } from "./outboxRepository";
import { OutboxProcessor, MessagePublisher, OutboxProcessorConfig } from "./outboxProcessor";

export interface TransactionContext {
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export class OutboxService {
  private repository: OutboxRepository;
  private processor: OutboxProcessor;
  private pendingMessages: OutboxMessage[] = [];

  constructor(
    publisher: MessagePublisher,
    repository?: OutboxRepository,
    config?: Partial<OutboxProcessorConfig>
  ) {
    this.repository = repository || new InMemoryOutboxRepository();
    this.processor = new OutboxProcessor(this.repository, publisher, {
      batchSize: 100, pollIntervalMs: 1000, maxRetries: 3, retryDelayMs: 5000, ...config
    });
  }

  async addMessage(
    aggregateType: string,
    aggregateId: string,
    eventType: string,
    payload: Record<string, unknown>,
    metadata?: Partial<OutboxMetadata>
  ): Promise<OutboxMessage> {
    const message = new OutboxMessageBuilder()
      .withAggregateType(aggregateType)
      .withAggregateId(aggregateId)
      .withEventType(eventType)
      .withPayload(payload)
      .withMetadata({
        correlationId: metadata?.correlationId || crypto.randomUUID(),
        causationId: metadata?.causationId,
        userId: metadata?.userId,
        traceId: metadata?.traceId
      })
      .build();

    this.pendingMessages.push(message);
    return message;
  }

  async flush(): Promise<void> {
    if (this.pendingMessages.length === 0) return;
    await this.repository.saveMany(this.pendingMessages);
    this.pendingMessages = [];
  }

  start(): void { this.processor.start(); }
  stop(): void { this.processor.stop(); }

  async cleanup(daysOld: number = 7): Promise<number> {
    const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    return this.repository.deleteProcessed(cutoff);
  }
}
