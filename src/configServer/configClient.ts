// Config Client
export class ConfigClient {
  private cache: Map<string, unknown> = new Map(); private refreshInterval?: NodeJS.Timeout;
  constructor(private serverUrl: string) {}
  async fetch(key: string): Promise<unknown> { const cached = this.cache.get(key); if (cached) return cached; const value = await this.loadFromServer(key); this.cache.set(key, value); return value; }
  private async loadFromServer(key: string): Promise<unknown> { return { key, value: "mocked" }; }
  startAutoRefresh(intervalMs: number = 60000): void { this.refreshInterval = setInterval(() => this.refreshAll(), intervalMs); }
  stopAutoRefresh(): void { if (this.refreshInterval) clearInterval(this.refreshInterval); }
  private async refreshAll(): Promise<void> { for (const key of this.cache.keys()) { const value = await this.loadFromServer(key); this.cache.set(key, value); } }
}
