export interface DomainEvent<T = unknown> {
  readonly eventId: string;
  readonly eventType: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly payload: T;
  readonly metadata: EventMetadata;
  readonly version: number;
  readonly occurredAt: Date;
}

export interface EventMetadata {
  correlationId: string;
  causationId?: string;
  userId?: string;
  tenantId?: string;
  timestamp: Date;
}

export interface EventHandler<E extends DomainEvent = DomainEvent> {
  eventType: string;
  handle(event: E): Promise<void>;
}

export interface EventSubscription {
  unsubscribe(): void;
}