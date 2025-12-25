/**
 * @fileoverview Aggregate Root pattern implementation
 * @module @sentinela/core/aggregate
 * @version 13.0.0
 */

export interface DomainEvent {
  type: string;
  occurredAt: Date;
  aggregateId: string;
}

export abstract class AggregateRoot {
  private uncommittedEvents: DomainEvent[] = [];
  private _version = 0;

  constructor(protected readonly id: string) {}

  get version(): number { return this._version; }

  protected apply(event: Omit<DomainEvent, 'occurredAt' | 'aggregateId'>): void {
    const fullEvent: DomainEvent = {
      ...event,
      occurredAt: new Date(),
      aggregateId: this.id
    };
    this.onEvent(fullEvent);
    this.uncommittedEvents.push(fullEvent);
    this._version++;
  }

  protected abstract onEvent(event: DomainEvent): void;

  getUncommittedEvents(): DomainEvent[] {
    return [...this.uncommittedEvents];
  }

  commit(): void {
    this.uncommittedEvents = [];
  }

  loadFromHistory(events: DomainEvent[]): void {
    for (const event of events) {
      this.onEvent(event);
      this._version++;
    }
  }
}

export abstract class Entity {
  constructor(protected readonly id: string) {}
  
  equals(other: Entity): boolean {
    return this.id === other.id;
  }
}

export abstract class ValueObject<T> {
  constructor(protected readonly props: T) {}

  equals(other: ValueObject<T>): boolean {
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
