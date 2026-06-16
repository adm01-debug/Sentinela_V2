type EventCallback<T = unknown> = (data: T) => void;

class EventEmitter {
  private events: Map<string, Set<EventCallback>> = new Map();

  on<T>(event: string, callback: EventCallback<T>): () => void {
    if (!this.events.has(event)) this.events.set(event, new Set());
    this.events.get(event)!.add(callback as EventCallback);
    return () => this.off(event, callback);
  }

  off<T>(event: string, callback: EventCallback<T>): void {
    this.events.get(event)?.delete(callback as EventCallback);
  }

  emit<T>(event: string, data?: T): void {
    this.events.get(event)?.forEach((cb) => cb(data));
  }

  once<T>(event: string, callback: EventCallback<T>): () => void {
    const wrapper: EventCallback<T> = (data) => {
      callback(data);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }

  clear(event?: string): void {
    if (event) this.events.delete(event);
    else this.events.clear();
  }
}

export const eventBus = new EventEmitter();
export { EventEmitter };
