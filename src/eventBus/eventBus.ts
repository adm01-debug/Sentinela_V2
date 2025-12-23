type EventCallback<T = any> = (payload: T) => void;
export class EventBus {
  private events = new Map<string, Set<EventCallback>>();
  on<T>(event: string, callback: EventCallback<T>): () => void { if (!this.events.has(event)) this.events.set(event, new Set()); this.events.get(event)!.add(callback); return () => this.off(event, callback); }
  off<T>(event: string, callback: EventCallback<T>): void { this.events.get(event)?.delete(callback); }
  emit<T>(event: string, payload: T): void { this.events.get(event)?.forEach(cb => cb(payload)); }
  once<T>(event: string, callback: EventCallback<T>): void { const wrapper: EventCallback<T> = (payload) => { callback(payload); this.off(event, wrapper); }; this.on(event, wrapper); }
  clear(event?: string): void { if (event) this.events.delete(event); else this.events.clear(); }
}
export const eventBus = new EventBus();
