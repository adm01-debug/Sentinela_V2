export interface SSLConfig { minVersion: string; maxVersion: string; ciphers: string[]; rejectUnauthorized: boolean; }
export const defaultSSLConfig: SSLConfig = { minVersion: 'TLSv1.2', maxVersion: 'TLSv1.3', ciphers: ['TLS_AES_256_GCM_SHA384', 'TLS_CHACHA20_POLY1305_SHA256'], rejectUnauthorized: true };
export class SSLConfigManager {
  private config: SSLConfig = { ...defaultSSLConfig };
  get(): SSLConfig { return { ...this.config }; }
  set(config: Partial<SSLConfig>): void { this.config = { ...this.config, ...config }; }
  reset(): void { this.config = { ...defaultSSLConfig }; }
}
export const sslConfigManager = new SSLConfigManager();
