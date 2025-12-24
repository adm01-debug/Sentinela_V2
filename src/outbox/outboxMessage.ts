// Outbox Message - Transactional Outbox Pattern
export interface OutboxMessage {
  id: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: Record<string, unknown>;
  metadata: OutboxMetadata;
  status: OutboxStatus;
  createdAt: Date;
  processedAt?: Date;
  retryCount: number;
  lastError?: string;
}

export interface OutboxMetadata {
  correlationId: string;
  causationId?: string;
  userId?: string;
  traceId?: string;
}

export type OutboxStatus = "pending" | "processing" | "processed" | "failed" | "dead_letter";

export class OutboxMessageBuilder {
  private message: Partial<OutboxMessage> = { status: "pending", retryCount: 0 };

  withId(id: string): this { this.message.id = id; return this; }
  withAggregateType(type: string): this { this.message.aggregateType = type; return this; }
  withAggregateId(id: string): this { this.message.aggregateId = id; return this; }
  withEventType(type: string): this { this.message.eventType = type; return this; }
  withPayload(payload: Record<string, unknown>): this { this.message.payload = payload; return this; }
  withMetadata(metadata: OutboxMetadata): this { this.message.metadata = metadata; return this; }

  build(): OutboxMessage {
    if (!this.message.id) this.message.id = crypto.randomUUID();
    this.message.createdAt = new Date();
    return this.message as OutboxMessage;
  }
}
