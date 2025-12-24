// Config Server
export interface ConfigEntry { key: string; value: unknown; env: string; version: number; }
export class ConfigServer {
  private configs: Map<string, ConfigEntry[]> = new Map();
  set(key: string, value: unknown, env: string = "default"): void {
    if (!this.configs.has(key)) this.configs.set(key, []);
    const entries = this.configs.get(key)!;
    const existing = entries.find(e => e.env === env);
    if (existing) { existing.value = value; existing.version++; } else { entries.push({ key, value, env, version: 1 }); }
  }
  get<T>(key: string, env: string = "default"): T | undefined { return this.configs.get(key)?.find(e => e.env === env)?.value as T; }
  getAll(env: string = "default"): Record<string, unknown> { const result: Record<string, unknown> = {}; for (const [key, entries] of this.configs) { const entry = entries.find(e => e.env === env); if (entry) result[key] = entry.value; } return result; }
}
