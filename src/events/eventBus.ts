type EventCallback<T = any> = (data: T) => void;

class EventBus {
  private events: Map<string, Set<EventCallback>> = new Map();

  on<T>(event: string, callback: EventCallback<T>): () => void {
    if (!this.events.has(event)) this.events.set(event, new Set());
    this.events.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  off<T>(event: string, callback: EventCallback<T>): void {
    this.events.get(event)?.delete(callback);
  }

  emit<T>(event: string, data?: T): void {
    this.events.get(event)?.forEach(callback => callback(data));
  }

  once<T>(event: string, callback: EventCallback<T>): void {
    const wrapper: EventCallback<T> = (data) => { this.off(event, wrapper); callback(data); };
    this.on(event, wrapper);
  }

  clear(event?: string): void {
    if (event) this.events.delete(event);
    else this.events.clear();
  }
}

export const eventBus = new EventBus();
