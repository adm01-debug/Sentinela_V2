export class SecretsManager {
  private secrets = new Map<string, string>();
  private encrypted = new Map<string, string>();
  set(key: string, value: string): void { this.secrets.set(key, value); }
  get(key: string): string | undefined { return this.secrets.get(key); }
  delete(key: string): boolean { return this.secrets.delete(key); }
  has(key: string): boolean { return this.secrets.has(key); }
  list(): string[] { return Array.from(this.secrets.keys()); }
  clear(): void { this.secrets.clear(); }
  getRequired(key: string): string { const value = this.get(key); if (!value) throw new Error('Secret not found: ' + key); return value; }
}
export const secretsManager = new SecretsManager();
