/**
 * @fileoverview Secret Vault
 * @module @sentinela/core/secretManagement
 */
export class SecretVault {
  private secrets = new Map<string, string>();
  async set(key: string, value: string): Promise<void> { this.secrets.set(key, value); }
  async get(key: string): Promise<string | undefined> { return this.secrets.get(key); }
  async delete(key: string): Promise<void> { this.secrets.delete(key); }
  async list(): Promise<string[]> { return Array.from(this.secrets.keys()); }
}
