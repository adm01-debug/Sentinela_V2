import { DataEncryptor } from './encryptor';
import { EncryptedData } from './types';

export class EncryptionProvider {
  constructor(private encryptor: DataEncryptor) {}
  
  async encryptField<T extends Record<string, unknown>>(obj: T, field: keyof T): Promise<T & { [K in keyof T]: K extends typeof field ? EncryptedData : T[K] }> {
    const value = obj[field];
    if (typeof value !== 'string') throw new Error('Can only encrypt string fields');
    const encrypted = await this.encryptor.encrypt(value);
    return { ...obj, [field]: encrypted } as T & { [K in keyof T]: K extends typeof field ? EncryptedData : T[K] };
  }
  
  async decryptField<T extends Record<string, unknown>>(obj: T, field: keyof T): Promise<T> {
    const encrypted = obj[field] as EncryptedData;
    const decrypted = await this.encryptor.decrypt(encrypted);
    return { ...obj, [field]: decrypted };
  }
  
  async encryptObject(obj: Record<string, string>, fields: string[]): Promise<Record<string, string | EncryptedData>> {
    const result: Record<string, string | EncryptedData> = { ...obj };
    for (const field of fields) {
      if (obj[field]) result[field] = await this.encryptor.encrypt(obj[field]);
    }
    return result;
  }
}