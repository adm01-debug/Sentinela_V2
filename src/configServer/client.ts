import { ConfigEntry } from './types';

export class ConfigClient {
  private cache: Map<string, ConfigEntry> = new Map();
  private refreshInterval?: NodeJS.Timeout;
  
  constructor(private serverUrl: string, private app: string, private env: string) {}
  
  async get<T>(key: string, defaultValue?: T): Promise<T> {
    const cached = this.cache.get(key);
    if (cached) return cached.value as T;
    return defaultValue as T;
  }
  
  async refresh(): Promise<void> {
    // Simulated refresh
    console.log('Refreshing config from server:', this.serverUrl);
  }
  
  startAutoRefresh(intervalMs: number = 60000): void {
    this.refreshInterval = setInterval(() => this.refresh(), intervalMs);
  }
  
  stopAutoRefresh(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }
  
  getAll(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    this.cache.forEach((entry, key) => { result[key] = entry.value; });
    return result;
  }
}