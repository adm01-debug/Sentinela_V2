import { EventEmitter } from 'events';

type EventHandler<T = unknown> = (data: T) => void | Promise<void>;

interface EventBusEvents {
  [key: string]: unknown;
}

class TypedEventBus<Events extends EventBusEvents = EventBusEvents> extends EventEmitter {
  private handlers = new Map<keyof Events, Set<EventHandler>>();

  publish<K extends keyof Events>(event: K, data: Events[K]): void {
    this.emit(event as string, data);
  }

  subscribe<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    
    this.handlers.get(event)!.add(handler as EventHandler);
    this.on(event as string, handler);

    // Return unsubscribe function
    return () => this.unsubscribe(event, handler);
  }

  unsubscribe<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void {
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      eventHandlers.delete(handler as EventHandler);
    }
    this.off(event as string, handler);
  }

  once<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void {
    super.once(event as string, handler);
  }

  clearEvent<K extends keyof Events>(event: K): void {
    this.handlers.delete(event);
    this.removeAllListeners(event as string);
  }

  clearAll(): void {
    this.handlers.clear();
    this.removeAllListeners();
  }

  getListenerCount<K extends keyof Events>(event: K): number {
    return this.listenerCount(event as string);
  }
}

// Default event bus with common events
interface AppEvents extends EventBusEvents {
  'activity:detected': { type: string; timestamp: Date };
  'screenshot:captured': { path: string; size: number };
  'sync:started': { timestamp: Date };
  'sync:completed': { success: boolean; duration: number };
  'error:occurred': { error: Error; context: string };
}

export const eventBus = new TypedEventBus<AppEvents>();
export { TypedEventBus };
export type { EventHandler, EventBusEvents, AppEvents };
