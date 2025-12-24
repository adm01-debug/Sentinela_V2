import { DomainEvent, EventHandler, EventSubscription } from './types';

export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
  subscribe(handler: EventHandler): EventSubscription;
}

export class InMemoryEventBus implements EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  
  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) ?? new Set();
    const allHandlers = this.handlers.get('*') ?? new Set();
    for (const h of [...handlers, ...allHandlers]) {
      try { await h.handle(event); }
      catch (e) { console.error('Event handler error:', e); }
    }
  }
  
  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) await this.publish(event);
  }
  
  subscribe(handler: EventHandler): EventSubscription {
    const handlers = this.handlers.get(handler.eventType) ?? new Set();
    handlers.add(handler);
    this.handlers.set(handler.eventType, handlers);
    return { unsubscribe: () => handlers.delete(handler) };
  }
}