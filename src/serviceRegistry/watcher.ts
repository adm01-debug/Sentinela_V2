// Service Watcher
export type WatchEvent = "added" | "removed" | "updated";
export class ServiceWatcher {
  private watchers: Map<string, Set<(event: WatchEvent, data: unknown) => void>> = new Map();
  watch(serviceName: string, callback: (event: WatchEvent, data: unknown) => void): () => void {
    if (!this.watchers.has(serviceName)) this.watchers.set(serviceName, new Set());
    this.watchers.get(serviceName)!.add(callback);
    return () => this.watchers.get(serviceName)?.delete(callback);
  }
  notify(serviceName: string, event: WatchEvent, data: unknown): void { this.watchers.get(serviceName)?.forEach(cb => cb(event, data)); }
}
