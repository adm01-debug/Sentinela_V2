/**
 * @fileoverview Encryption at rest implementation
 * @module @sentinela/core/encryptionAtRest
 * @version 13.0.0
 */

import * as crypto from 'crypto';

export interface EncryptorConfig {
  algorithm: 'aes-256-gcm' | 'aes-256-cbc';
  keyId?: string;
}

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  tag?: string;
  algorithm: string;
  keyId?: string;
}

export class Encryptor {
  private key: Buffer;

  constructor(private config: EncryptorConfig) {
    this.key = crypto.randomBytes(32);
  }

  async encrypt(plaintext: string): Promise<EncryptedData> {
    const iv = crypto.randomBytes(16);
    
    if (this.config.algorithm === 'aes-256-gcm') {
      const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
      let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
      ciphertext += cipher.final('base64');
      const tag = cipher.getAuthTag().toString('base64');
      return { ciphertext, iv: iv.toString('base64'), tag, algorithm: this.config.algorithm, keyId: this.config.keyId };
    } else {
      const cipher = crypto.createCipheriv('aes-256-cbc', this.key, iv);
      let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
      ciphertext += cipher.final('base64');
      return { ciphertext, iv: iv.toString('base64'), algorithm: this.config.algorithm, keyId: this.config.keyId };
    }
  }

  async decrypt(data: EncryptedData): Promise<string> {
    const iv = Buffer.from(data.iv, 'base64');
    
    if (data.algorithm === 'aes-256-gcm' && data.tag) {
      const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
      decipher.setAuthTag(Buffer.from(data.tag, 'base64'));
      let plaintext = decipher.update(data.ciphertext, 'base64', 'utf8');
      plaintext += decipher.final('utf8');
      return plaintext;
    } else {
      const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, iv);
      let plaintext = decipher.update(data.ciphertext, 'base64', 'utf8');
      plaintext += decipher.final('utf8');
      return plaintext;
    }
  }
}
