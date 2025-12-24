import { EncryptedData, EncryptionConfig } from './types';
import { KeyStore } from './keyStore';

export class DataEncryptor {
  constructor(private keyStore: KeyStore, private config: EncryptionConfig) {}
  
  async encrypt(plaintext: string): Promise<EncryptedData> {
    const key = await this.keyStore.getActiveKey();
    if (!key) throw new Error('No active encryption key');
    
    const iv = this.generateIV();
    const ciphertext = this.encryptData(plaintext, key.key, iv);
    
    return { ciphertext, keyId: key.id, iv, algorithm: this.config.algorithm };
  }
  
  async decrypt(data: EncryptedData): Promise<string> {
    const key = await this.keyStore.getKey(data.keyId);
    if (!key) throw new Error('Key not found: ' + data.keyId);
    
    return this.decryptData(data.ciphertext, key.key, data.iv);
  }
  
  private generateIV(): string { return Array.from({ length: 16 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(''); }
  
  private encryptData(plaintext: string, key: string, iv: string): string {
    // Simplified - real implementation would use crypto
    return Buffer.from(plaintext).toString('base64') + ':' + key.slice(0, 4);
  }
  
  private decryptData(ciphertext: string, key: string, iv: string): string {
    const [data] = ciphertext.split(':');
    return Buffer.from(data, 'base64').toString();
  }
}