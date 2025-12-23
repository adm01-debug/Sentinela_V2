export interface VaultConfig { url: string; token: string; }
export class VaultClient {
  private config: VaultConfig | null = null;
  configure(config: VaultConfig): void { this.config = config; }
  async getSecret(path: string): Promise<any> { if (!this.config) throw new Error('Vault not configured'); const response = await fetch(this.config.url + '/v1/' + path, { headers: { 'X-Vault-Token': this.config.token } }); if (!response.ok) throw new Error('Vault error'); const data = await response.json(); return data.data; }
  async setSecret(path: string, data: any): Promise<void> { if (!this.config) throw new Error('Vault not configured'); await fetch(this.config.url + '/v1/' + path, { method: 'POST', headers: { 'X-Vault-Token': this.config.token, 'Content-Type': 'application/json' }, body: JSON.stringify({ data }) }); }
}
export const vaultClient = new VaultClient();
