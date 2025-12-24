import { ConfigChange } from './types';

export class ConfigWatcher {
  private watchers: Map<string, Set<(change: ConfigChange) => void>> = new Map();
  
  watch(key: string, callback: (change: ConfigChange) => void): () => void {
    const callbacks = this.watchers.get(key) ?? new Set();
    callbacks.add(callback);
    this.watchers.set(key, callbacks);
    return () => callbacks.delete(callback);
  }
  
  notify(change: ConfigChange): void {
    const callbacks = this.watchers.get(change.key) ?? new Set();
    const allCallbacks = this.watchers.get('*') ?? new Set();
    [...callbacks, ...allCallbacks].forEach(cb => cb(change));
  }
  
  watchAll(callback: (change: ConfigChange) => void): () => void {
    return this.watch('*', callback);
  }
}