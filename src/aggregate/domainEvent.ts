import { DomainEvent } from './types';
import { v4 as uuidv4 } from 'uuid';

export class DomainEventBuilder {
  static create<T>(eventType: string, aggregateId: string, payload: T): DomainEvent {
    return { eventId: uuidv4(), eventType, aggregateId, occurredAt: new Date(), payload };
  }
}

export class DomainEventDispatcher {
  private handlers: Map<string, ((event: DomainEvent) => Promise<void>)[]> = new Map();
  
  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
    const handlers = this.handlers.get(eventType) ?? [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }
  
  async dispatch(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) ?? [];
    await Promise.all(handlers.map(h => h(event)));
  }
  
  async dispatchAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) await this.dispatch(event);
  }
}