// Config Versioning
export interface ConfigVersion { version: number; timestamp: Date; changes: string[]; }
export class ConfigVersioning {
  private history: Map<string, ConfigVersion[]> = new Map();
  record(key: string, changes: string[]): number { if (!this.history.has(key)) this.history.set(key, []); const versions = this.history.get(key)!; const version = versions.length + 1; versions.push({ version, timestamp: new Date(), changes }); return version; }
  getHistory(key: string): ConfigVersion[] { return this.history.get(key) || []; }
  rollback(key: string, toVersion: number): ConfigVersion | undefined { const versions = this.history.get(key); return versions?.find(v => v.version === toVersion); }
}
