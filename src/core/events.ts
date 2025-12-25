/**
 * @packageDocumentation
 * @module Core/Events
 * Event emitter utilities
 */
import { Logger, logger as defaultLogger } from './logger';

export type EventHandler<T> = (event: T) => void | Promise<void>;

export interface EventSubscription {
  unsubscribe(): void;
}

/**
 * Type-safe event emitter
 */
export class EventEmitter<TEvents extends Record<string, unknown>> {
  private handlers: Map<keyof TEvents, Set<EventHandler<unknown>>> = new Map();
  private readonly logger: Logger;

  constructor(logger: Logger = defaultLogger) {
    this.logger = logger.child({ component: 'EventEmitter' });
  }

  on<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): EventSubscription {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler as EventHandler<unknown>);
    
    return {
      unsubscribe: () => this.off(event, handler)
    };
  }

  once<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): EventSubscription {
    const wrapper: EventHandler<TEvents[K]> = (data) => {
      this.off(event, wrapper);
      handler(data);
    };
    return this.on(event, wrapper);
  }

  off<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): void {
    this.handlers.get(event)?.delete(handler as EventHandler<unknown>);
  }

  async emit<K extends keyof TEvents>(event: K, data: TEvents[K]): Promise<void> {
    const handlers = this.handlers.get(event);
    if (!handlers || handlers.size === 0) return;

    const promises: Promise<void>[] = [];
    for (const handler of handlers) {
      try {
        const result = handler(data);
        if (result instanceof Promise) {
          promises.push(result.catch(e => {
            this.logger.error('Event handler error', e as Error, { event: String(event) });
          }));
        }
      } catch (error) {
        this.logger.error('Event handler error', error as Error, { event: String(event) });
      }
    }

    await Promise.all(promises);
  }

  removeAllListeners<K extends keyof TEvents>(event?: K): void {
    if (event) {
      this.handlers.delete(event);
    } else {
      this.handlers.clear();
    }
  }

  listenerCount<K extends keyof TEvents>(event: K): number {
    return this.handlers.get(event)?.size ?? 0;
  }
}

/**
 * Domain event base interface
 */
export interface DomainEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly occurredAt: Date;
  readonly aggregateId?: string;
  readonly aggregateType?: string;
  readonly version?: number;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Domain event bus for DDD
 */
export class DomainEventBus {
  private handlers: Map<string, Set<EventHandler<DomainEvent>>> = new Map();
  private readonly logger: Logger;

  constructor(logger: Logger = defaultLogger) {
    this.logger = logger.child({ component: 'DomainEventBus' });
  }

  subscribe(eventType: string, handler: EventHandler<DomainEvent>): EventSubscription {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    return {
      unsubscribe: () => this.handlers.get(eventType)?.delete(handler)
    };
  }

  async publish(event: DomainEvent): Promise<void> {
    this.logger.debug('Publishing domain event', { eventType: event.eventType, eventId: event.eventId });

    const handlers = this.handlers.get(event.eventType) ?? new Set();
    const wildcardHandlers = this.handlers.get('*') ?? new Set();

    const allHandlers = [...handlers, ...wildcardHandlers];
    
    for (const handler of allHandlers) {
      try {
        await handler(event);
      } catch (error) {
        this.logger.error('Domain event handler error', error as Error, {
          eventType: event.eventType,
          eventId: event.eventId
        });
      }
    }
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }
}

export const globalEventBus = new DomainEventBus();
