/**
 * @fileoverview Domain Events Dispatcher implementation
 * @module @sentinela/core/domainEvents
 * @version 13.0.0
 */

export interface DomainEvent {
  type: string;
  occurredAt: Date;
  aggregateId?: string;
  [key: string]: unknown;
}

export type DomainEventHandler<T extends DomainEvent = DomainEvent> = (event: T) => void | Promise<void>;

export class DomainEventDispatcher {
  private handlers = new Map<string, DomainEventHandler[]>();

  register<T extends DomainEvent>(eventType: string, handler: DomainEventHandler<T>): () => void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler as DomainEventHandler);
    this.handlers.set(eventType, handlers);
    
    return () => {
      const currentHandlers = this.handlers.get(eventType) || [];
      this.handlers.set(eventType, currentHandlers.filter(h => h !== handler));
    };
  }

  async dispatch(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    await Promise.all(handlers.map(h => h(event)));
  }

  async dispatchAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.dispatch(event);
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}

export const domainEventDispatcher = new DomainEventDispatcher();
