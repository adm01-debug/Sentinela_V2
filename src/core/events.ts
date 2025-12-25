/**
 * @fileoverview Event emitter utilities
 * @module @sentinela/core/events
 */

import { Disposable } from './disposable';
import { createLogger } from './logger';

const logger = createLogger('events');

export type EventHandler<T = unknown> = (event: T) => void | Promise<void>;

export interface TypedEventEmitter<Events extends Record<string, unknown>> extends Disposable {
  on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): () => void;
  once<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): () => void;
  off<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void;
  emit<K extends keyof Events>(event: K, payload: Events[K]): Promise<void>;
}

/**
 * Type-safe event emitter
 */
export class EventBus<Events extends Record<string, unknown>> implements TypedEventEmitter<Events> {
  private readonly handlers: Map<keyof Events, Set<EventHandler>> = new Map();
  private readonly onceHandlers: Map<keyof Events, Set<EventHandler>> = new Map();

  on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler as EventHandler);
    
    return () => this.off(event, handler);
  }

  once<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): () => void {
    if (!this.onceHandlers.has(event)) {
      this.onceHandlers.set(event, new Set());
    }
    this.onceHandlers.get(event)!.add(handler as EventHandler);
    
    return () => {
      this.onceHandlers.get(event)?.delete(handler as EventHandler);
    };
  }

  off<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void {
    this.handlers.get(event)?.delete(handler as EventHandler);
    this.onceHandlers.get(event)?.delete(handler as EventHandler);
  }

  async emit<K extends keyof Events>(event: K, payload: Events[K]): Promise<void> {
    const handlers = this.handlers.get(event) || new Set();
    const onceHandlers = this.onceHandlers.get(event) || new Set();
    
    const allHandlers = [...handlers, ...onceHandlers];
    this.onceHandlers.delete(event);

    for (const handler of allHandlers) {
      try {
        await handler(payload);
      } catch (error) {
        logger.error(`Error in event handler for ${String(event)}`, error as Error);
      }
    }
  }

  removeAllListeners(event?: keyof Events): void {
    if (event) {
      this.handlers.delete(event);
      this.onceHandlers.delete(event);
    } else {
      this.handlers.clear();
      this.onceHandlers.clear();
    }
  }

  listenerCount(event: keyof Events): number {
    const regular = this.handlers.get(event)?.size || 0;
    const once = this.onceHandlers.get(event)?.size || 0;
    return regular + once;
  }

  dispose(): void {
    this.removeAllListeners();
  }
}

/**
 * Observable pattern
 */
export interface Observable<T> {
  subscribe(observer: Observer<T>): () => void;
}

export interface Observer<T> {
  next(value: T): void;
  error?(error: Error): void;
  complete?(): void;
}

export class Subject<T> implements Observable<T>, Disposable {
  private readonly observers: Set<Observer<T>> = new Set();
  private completed = false;

  subscribe(observer: Observer<T>): () => void {
    if (this.completed) {
      observer.complete?.();
      return () => {};
    }
    
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  next(value: T): void {
    if (this.completed) return;
    for (const observer of this.observers) {
      try {
        observer.next(value);
      } catch (error) {
        observer.error?.(error as Error);
      }
    }
  }

  error(error: Error): void {
    for (const observer of this.observers) {
      observer.error?.(error);
    }
    this.complete();
  }

  complete(): void {
    if (this.completed) return;
    this.completed = true;
    for (const observer of this.observers) {
      observer.complete?.();
    }
    this.observers.clear();
  }

  dispose(): void {
    this.complete();
  }
}

/**
 * BehaviorSubject - Subject that remembers the last value
 */
export class BehaviorSubject<T> extends Subject<T> {
  private currentValue: T;

  constructor(initialValue: T) {
    super();
    this.currentValue = initialValue;
  }

  getValue(): T {
    return this.currentValue;
  }

  override next(value: T): void {
    this.currentValue = value;
    super.next(value);
  }

  override subscribe(observer: Observer<T>): () => void {
    observer.next(this.currentValue);
    return super.subscribe(observer);
  }
}
