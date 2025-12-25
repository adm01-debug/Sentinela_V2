/**
 * @fileoverview Aggregate pattern types
 * @module @sentinela/core/aggregate
 * @version 13.0.0
 */

export interface AggregateRoot<ID = string> {
  readonly id: ID;
  readonly version: number;
  readonly domainEvents: DomainEvent[];
  clearEvents(): void;
}

export interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  occurredAt: Date;
  payload: unknown;
}

export interface AggregateFactory<T, C> {
  create(command: C): T;
  reconstitute(id: string, events: DomainEvent[]): T;
}