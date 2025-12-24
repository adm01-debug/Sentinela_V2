// CQRS Advanced Types
export interface Command<T = unknown> {
  readonly type: string;
  readonly payload: T;
  readonly metadata: CommandMetadata;
}

export interface CommandMetadata {
  readonly commandId: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly timestamp: Date;
  readonly userId?: string;
  readonly tenantId?: string;
}

export interface Query<T = unknown> {
  readonly type: string;
  readonly payload: T;
  readonly metadata: QueryMetadata;
}

export interface QueryMetadata {
  readonly queryId: string;
  readonly correlationId: string;
  readonly timestamp: Date;
  readonly userId?: string;
  readonly tenantId?: string;
}

export interface DomainEvent<T = unknown> {
  readonly eventId: string;
  readonly eventType: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly payload: T;
  readonly metadata: EventMetadata;
  readonly version: number;
}

export interface EventMetadata {
  readonly correlationId: string;
  readonly causationId: string;
  readonly timestamp: Date;
  readonly userId?: string;
  readonly tenantId?: string;
}

export interface CommandHandler<C extends Command = Command, R = void> {
  readonly commandType: string;
  handle(command: C): Promise<R>;
}

export interface QueryHandler<Q extends Query = Query, R = unknown> {
  readonly queryType: string;
  handle(query: Q): Promise<R>;
}

export interface EventHandler<E extends DomainEvent = DomainEvent> {
  readonly eventType: string;
  handle(event: E): Promise<void>;
}

export interface AggregateRoot<S = unknown> {
  readonly id: string;
  readonly version: number;
  readonly uncommittedEvents: DomainEvent[];
  getState(): S;
  loadFromHistory(events: DomainEvent[]): void;
  commit(): DomainEvent[];
}
