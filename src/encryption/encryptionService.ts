import { aesEncryption } from './aesEncryption';
import { rsaEncryption } from './rsaEncryption';
export type EncryptionType = 'aes' | 'rsa';
export const encryptionService = {
  async encrypt(data: string, type: EncryptionType = 'aes'): Promise<any> { return type === 'aes' ? aesEncryption.encrypt(data) : rsaEncryption.encrypt(data); },
  async decrypt(data: any, type: EncryptionType = 'aes'): Promise<string> { return type === 'aes' ? aesEncryption.decrypt(data.encrypted, data.iv) : rsaEncryption.decrypt(data); },
  async encryptObject<T>(obj: T, type: EncryptionType = 'aes'): Promise<any> { return this.encrypt(JSON.stringify(obj), type); },
  async decryptObject<T>(data: any, type: EncryptionType = 'aes'): Promise<T> { return JSON.parse(await this.decrypt(data, type)); },
};
