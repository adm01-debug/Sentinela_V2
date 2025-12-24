import { ConfigValue } from './types';

export class ConfigClient {
  private cache: Map<string, ConfigValue> = new Map();
  private refreshInterval?: NodeJS.Timeout;
  
  constructor(private serverUrl: string) {}
  
  async get(key: string): Promise<unknown> {
    const cached = this.cache.get(key);
    if (cached) return cached.value;
    const value = await this.fetch(key);
    if (value) this.cache.set(key, value);
    return value?.value;
  }
  
  async refresh(): Promise<void> {
    for (const key of this.cache.keys()) {
      const value = await this.fetch(key);
      if (value) this.cache.set(key, value);
    }
  }
  
  startAutoRefresh(intervalMs: number): void {
    this.refreshInterval = setInterval(() => this.refresh(), intervalMs);
  }
  
  stopAutoRefresh(): void { if (this.refreshInterval) clearInterval(this.refreshInterval); }
  
  private async fetch(key: string): Promise<ConfigValue | null> {
    return { key, value: null, source: 'server', version: 1, updatedAt: new Date() };
  }
}