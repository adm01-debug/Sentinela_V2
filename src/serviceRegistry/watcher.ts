import { ServiceRegistration, RegistrationStatus } from './types';

export type WatchCallback = (event: WatchEvent) => void;

export interface WatchEvent {
  type: 'added' | 'removed' | 'updated';
  service: ServiceRegistration;
  timestamp: Date;
}

export class ServiceWatcher {
  private watchers: Map<string, Set<WatchCallback>> = new Map();
  
  watch(serviceName: string, callback: WatchCallback): () => void {
    const callbacks = this.watchers.get(serviceName) ?? new Set();
    callbacks.add(callback);
    this.watchers.set(serviceName, callbacks);
    return () => callbacks.delete(callback);
  }
  
  notify(serviceName: string, event: WatchEvent): void {
    const callbacks = this.watchers.get(serviceName) ?? new Set();
    const allCallbacks = this.watchers.get('*') ?? new Set();
    [...callbacks, ...allCallbacks].forEach(cb => cb(event));
  }
  
  watchAll(callback: WatchCallback): () => void {
    return this.watch('*', callback);
  }
}