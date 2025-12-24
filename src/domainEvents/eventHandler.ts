import { DomainEvent, EventHandler } from './types';

export abstract class BaseEventHandler<E extends DomainEvent = DomainEvent> implements EventHandler<E> {
  abstract readonly eventType: string;
  abstract handle(event: E): Promise<void>;
}

export class CompositeEventHandler implements EventHandler {
  readonly eventType: string = '*';
  private handlers: EventHandler[] = [];
  
  add(handler: EventHandler): this { this.handlers.push(handler); return this; }
  
  async handle(event: DomainEvent): Promise<void> {
    const matching = this.handlers.filter(h => h.eventType === event.eventType || h.eventType === '*');
    await Promise.all(matching.map(h => h.handle(event)));
  }
}

export function createEventHandler<T>(eventType: string, handler: (event: DomainEvent<T>) => Promise<void>): EventHandler {
  return { eventType, handle: handler as (event: DomainEvent) => Promise<void> };
}