/**
 * @fileoverview Event Emitter
 * @module @sentinela/core/emitter
 */
export type Listener<T> = (data: T) => void;
export class Emitter<Events extends Record<string, unknown>> {
  private listeners = new Map<keyof Events, Set<Listener<unknown>>>();
  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener as Listener<unknown>);
    return () => this.off(event, listener);
  }
  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void { this.listeners.get(event)?.delete(listener as Listener<unknown>); }
  emit<K extends keyof Events>(event: K, data: Events[K]): void { this.listeners.get(event)?.forEach(l => l(data)); }
  once<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void { const off = this.on(event, data => { off(); listener(data); }); return off; }
}
