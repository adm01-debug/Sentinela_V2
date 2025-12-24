import { ServiceDefinition } from './types';

export class ServiceWatcher {
  private watchers: Map<string, Set<WatchCallback>> = new Map();
  
  watch(serviceName: string, callback: WatchCallback): () => void {
    const watchers = this.watchers.get(serviceName) ?? new Set();
    watchers.add(callback);
    this.watchers.set(serviceName, watchers);
    return () => watchers.delete(callback);
  }
  
  notify(serviceName: string, event: WatchEvent, service: ServiceDefinition): void {
    this.watchers.get(serviceName)?.forEach(cb => cb(event, service));
    this.watchers.get('*')?.forEach(cb => cb(event, service));
  }
  
  watchAll(callback: WatchCallback): () => void { return this.watch('*', callback); }
}

export type WatchEvent = 'added' | 'updated' | 'removed';
export type WatchCallback = (event: WatchEvent, service: ServiceDefinition) => void;