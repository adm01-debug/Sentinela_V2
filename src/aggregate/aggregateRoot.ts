import { AggregateRoot as IAggregateRoot, DomainEvent } from './types';
import { v4 as uuidv4 } from 'uuid';

export abstract class AggregateRoot<ID = string> implements IAggregateRoot<ID> {
  private _domainEvents: DomainEvent[] = [];
  private _version: number = 0;
  
  constructor(public readonly id: ID) {}
  
  get version(): number { return this._version; }
  get domainEvents(): DomainEvent[] { return [...this._domainEvents]; }
  
  protected addDomainEvent(eventType: string, payload: unknown): void {
    this._domainEvents.push({
      eventId: uuidv4(),
      eventType,
      aggregateId: String(this.id),
      occurredAt: new Date(),
      payload
    });
    this._version++;
  }
  
  clearEvents(): void { this._domainEvents = []; }
  
  protected apply(event: DomainEvent): void {
    const handler = (this as any)[`on${event.eventType}`];
    if (handler) handler.call(this, event.payload);
    this._version = Math.max(this._version, 1);
  }
  
  loadFromHistory(events: DomainEvent[]): void {
    events.forEach(e => this.apply(e));
  }
}