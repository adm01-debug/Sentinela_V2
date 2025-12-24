import { ConfigEntry, ConfigQuery } from './types';

export class ConfigServer {
  private configs: Map<string, ConfigEntry> = new Map();
  private watchers: Map<string, Set<(entry: ConfigEntry) => void>> = new Map();
  
  set(key: string, value: unknown, app: string, env: string): ConfigEntry {
    const existing = this.configs.get(this.makeKey(key, app, env));
    const entry: ConfigEntry = {
      key, value, version: (existing?.version ?? 0) + 1,
      environment: env, application: app,
      createdAt: existing?.createdAt ?? new Date(), updatedAt: new Date()
    };
    this.configs.set(this.makeKey(key, app, env), entry);
    this.notifyWatchers(key, entry);
    return entry;
  }
  
  get(key: string, app: string, env: string): ConfigEntry | undefined {
    return this.configs.get(this.makeKey(key, app, env));
  }
  
  query(q: ConfigQuery): ConfigEntry[] {
    return Array.from(this.configs.values()).filter(e => {
      if (q.application && e.application !== q.application) return false;
      if (q.environment && e.environment !== q.environment) return false;
      if (q.prefix && !e.key.startsWith(q.prefix)) return false;
      return true;
    });
  }
  
  watch(key: string, callback: (entry: ConfigEntry) => void): () => void {
    const watchers = this.watchers.get(key) ?? new Set();
    watchers.add(callback);
    this.watchers.set(key, watchers);
    return () => watchers.delete(callback);
  }
  
  private makeKey(key: string, app: string, env: string): string { return app + '/' + env + '/' + key; }
  private notifyWatchers(key: string, entry: ConfigEntry): void {
    this.watchers.get(key)?.forEach(cb => cb(entry));
  }
}