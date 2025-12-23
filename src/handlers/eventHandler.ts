type EventCallback = (...args: any[]) => void;
class EventHandler {
  private handlers: Map<string, Set<EventCallback>> = new Map();
  on(event: string, callback: EventCallback) { if (!this.handlers.has(event)) this.handlers.set(event, new Set()); this.handlers.get(event)!.add(callback); return () => this.off(event, callback); }
  off(event: string, callback: EventCallback) { this.handlers.get(event)?.delete(callback); }
  emit(event: string, ...args: any[]) { this.handlers.get(event)?.forEach(cb => cb(...args)); }
  once(event: string, callback: EventCallback) { const wrapper = (...args: any[]) => { callback(...args); this.off(event, wrapper); }; this.on(event, wrapper); }
}
export const eventHandler = new EventHandler();
