export class EventEmitter<T extends Record<string, any>> {
  private listeners = new Map<keyof T, Set<(data: any) => void>>();
  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): () => void { if (!this.listeners.has(event)) this.listeners.set(event, new Set()); this.listeners.get(event)!.add(listener); return () => this.off(event, listener); }
  off<K extends keyof T>(event: K, listener: (data: T[K]) => void): void { this.listeners.get(event)?.delete(listener); }
  emit<K extends keyof T>(event: K, data: T[K]): void { this.listeners.get(event)?.forEach(l => l(data)); }
  removeAllListeners(event?: keyof T): void { if (event) this.listeners.delete(event); else this.listeners.clear(); }
}
