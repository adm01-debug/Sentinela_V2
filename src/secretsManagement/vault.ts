export interface Secret { id: string; key: string; value: string; version: number; createdAt: Date; expiresAt?: Date; metadata?: Record<string, string>; }
export class Vault {
  private secrets = new Map<string, Secret>();
  private encrypted = true;
  store(key: string, value: string, expiresAt?: Date, metadata?: Record<string, string>): Secret { const existing = this.secrets.get(key); const secret: Secret = { id: crypto.randomUUID(), key, value: this.encrypted ? btoa(value) : value, version: existing ? existing.version + 1 : 1, createdAt: new Date(), expiresAt, metadata }; this.secrets.set(key, secret); return secret; }
  retrieve(key: string): string | null { const secret = this.secrets.get(key); if (!secret) return null; if (secret.expiresAt && secret.expiresAt < new Date()) return null; return this.encrypted ? atob(secret.value) : secret.value; }
  delete(key: string): boolean { return this.secrets.delete(key); }
  list(): string[] { return Array.from(this.secrets.keys()); }
}
export const vault = new Vault();
