type EventCallback = (...args: any[]) => void;

class EventBus {
  private events = new Map<string, Set<EventCallback>>();

  on(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) this.events.set(event, new Set());
    this.events.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback: EventCallback): void {
    this.events.get(event)?.delete(callback);
  }

  emit(event: string, ...args: any[]): void {
    this.events.get(event)?.forEach(cb => cb(...args));
  }

  once(event: string, callback: EventCallback): void {
    const wrapper = (...args: any[]) => { callback(...args); this.off(event, wrapper); };
    this.on(event, wrapper);
  }

  clear(event?: string): void {
    if (event) this.events.delete(event);
    else this.events.clear();
  }
}

export const eventBus = new EventBus();
