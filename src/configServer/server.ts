import { ConfigServerConfig, ConfigValue } from './types';

export class ConfigServer {
  private config: Map<string, ConfigValue> = new Map();
  private watchers: Map<string, Set<(value: ConfigValue) => void>> = new Map();
  private version: number = 0;
  
  constructor(private serverConfig: ConfigServerConfig) {}
  
  set(key: string, value: unknown, source: string = 'manual'): void {
    this.version++;
    const configValue: ConfigValue = { key, value, source, version: this.version, updatedAt: new Date() };
    this.config.set(key, configValue);
    this.notifyWatchers(key, configValue);
  }
  
  get(key: string): unknown { return this.config.get(key)?.value; }
  getWithMetadata(key: string): ConfigValue | undefined { return this.config.get(key); }
  getAll(): Map<string, ConfigValue> { return new Map(this.config); }
  
  watch(key: string, callback: (value: ConfigValue) => void): () => void {
    const watchers = this.watchers.get(key) ?? new Set();
    watchers.add(callback);
    this.watchers.set(key, watchers);
    return () => watchers.delete(callback);
  }
  
  private notifyWatchers(key: string, value: ConfigValue): void {
    this.watchers.get(key)?.forEach(cb => cb(value));
    this.watchers.get('*')?.forEach(cb => cb(value));
  }
}