import { EncryptionKey } from './types';
import { v4 as uuidv4 } from 'uuid';

export class KeyStore {
  private keys: Map<string, EncryptionKey> = new Map();
  private activeKeyId?: string;
  
  async generateKey(algorithm: string): Promise<EncryptionKey> {
    const key: EncryptionKey = {
      id: uuidv4(),
      algorithm,
      key: this.generateRandomKey(),
      createdAt: new Date(),
      status: 'active'
    };
    
    if (this.activeKeyId) {
      const oldKey = this.keys.get(this.activeKeyId);
      if (oldKey) oldKey.status = 'rotated';
    }
    
    this.keys.set(key.id, key);
    this.activeKeyId = key.id;
    return key;
  }
  
  async getActiveKey(): Promise<EncryptionKey | undefined> {
    return this.activeKeyId ? this.keys.get(this.activeKeyId) : undefined;
  }
  
  async getKey(id: string): Promise<EncryptionKey | undefined> { return this.keys.get(id); }
  
  async rotateKey(): Promise<EncryptionKey> {
    const current = await this.getActiveKey();
    return this.generateKey(current?.algorithm ?? 'aes-256-gcm');
  }
  
  private generateRandomKey(): string {
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
  }
  
  listKeys(): EncryptionKey[] { return Array.from(this.keys.values()); }
}