/**
 * @fileoverview Config Server Client
 * @module @sentinela/core/configServer
 */
export interface ConfigClientOptions { endpoint: string; refreshInterval?: number; }
export class ConfigClient {
  private cache = new Map<string, unknown>();
  constructor(private options: ConfigClientOptions) {}
  async get<T>(key: string): Promise<T | undefined> { return this.cache.get(key) as T; }
  async set(key: string, value: unknown): Promise<void> { this.cache.set(key, value); }
  async refresh(): Promise<void> { /* fetch from server */ }
}
