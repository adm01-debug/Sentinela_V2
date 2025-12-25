/**
 * @fileoverview Config Server Client
 * @module @sentinela/core/configServer
 * @version 13.0.0
 */
export interface ConfigClientOptions { endpoint: string; refreshInterval?: number; }
export class ConfigClient {
  private config = new Map<string, unknown>();
  constructor(private options: ConfigClientOptions) {}
  async get<T>(key: string): Promise<T | undefined> { return this.config.get(key) as T; }
  async set(key: string, value: unknown): Promise<void> { this.config.set(key, value); }
  async refresh(): Promise<void> { /* fetch from server */ }
}
