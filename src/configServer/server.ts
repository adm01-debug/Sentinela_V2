import { ConfigEntry, ConfigQuery, ConfigChange } from './types';

export class ConfigServer {
  private configs: Map<string, ConfigEntry> = new Map();
  private changeListeners: ((change: ConfigChange) => void)[] = [];
  
  set(key: string, value: unknown, app: string = 'default', env: string = 'default'): ConfigEntry {
    const fullKey = app + ':' + env + ':' + key;
    const existing = this.configs.get(fullKey);
    const entry: ConfigEntry = {
      key, value, version: (existing?.version ?? 0) + 1, environment: env, application: app,
      createdAt: existing?.createdAt ?? new Date(), updatedAt: new Date()
    };
    this.configs.set(fullKey, entry);
    this.notifyChange({ key, oldValue: existing?.value, newValue: value, timestamp: new Date() });
    return entry;
  }
  
  get(key: string, app: string = 'default', env: string = 'default'): ConfigEntry | undefined {
    return this.configs.get(app + ':' + env + ':' + key);
  }
  
  query(q: ConfigQuery): ConfigEntry[] {
    return Array.from(this.configs.values()).filter(e =>
      (!q.application || e.application === q.application) &&
      (!q.environment || e.environment === q.environment) &&
      (!q.keys || q.keys.includes(e.key))
    );
  }
  
  delete(key: string, app: string = 'default', env: string = 'default'): boolean {
    return this.configs.delete(app + ':' + env + ':' + key);
  }
  
  onChange(listener: (change: ConfigChange) => void): () => void {
    this.changeListeners.push(listener);
    return () => { this.changeListeners = this.changeListeners.filter(l => l !== listener); };
  }
  
  private notifyChange(change: ConfigChange): void {
    this.changeListeners.forEach(l => l(change));
  }
}