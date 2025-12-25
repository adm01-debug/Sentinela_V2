/**
 * @fileoverview Data tokenizer
 * @module @sentinela/core/tokenization
 * @version 13.0.0
 */

import { Token, TokenizationConfig, TokenFormat } from './types';
import { TokenVault } from './vault';
import { v4 as uuidv4 } from 'uuid';

export class Tokenizer {
  constructor(private vault: TokenVault, private config: TokenizationConfig) {}
  
  async tokenize(value: string, metadata?: Record<string, string>): Promise<string> {
    const tokenValue = this.generateToken(value);
    const token: Token = {
      id: uuidv4(),
      value: tokenValue,
      originalFormat: this.detectFormat(value),
      createdAt: new Date(),
      expiresAt: this.config.ttl ? new Date(Date.now() + this.config.ttl) : undefined,
      metadata
    };
    
    await this.vault.store(token, value);
    return tokenValue;
  }
  
  async detokenize(tokenValue: string): Promise<string | null> {
    return this.vault.retrieve(tokenValue);
  }
  
  private generateToken(original: string): string {
    switch (this.config.format) {
      case 'uuid': return uuidv4();
      case 'numeric': return Array.from({ length: original.length }, () => Math.floor(Math.random() * 10)).join('');
      case 'alphanumeric': return Array.from({ length: original.length }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]).join('');
      case 'format_preserving': return this.formatPreservingToken(original);
    }
  }
  
  private formatPreservingToken(original: string): string {
    return original.split('').map(c => {
      if (/\d/.test(c)) return Math.floor(Math.random() * 10).toString();
      if (/[a-z]/.test(c)) return String.fromCharCode(97 + Math.floor(Math.random() * 26));
      if (/[A-Z]/.test(c)) return String.fromCharCode(65 + Math.floor(Math.random() * 26));
      return c;
    }).join('');
  }
  
  private detectFormat(value: string): string {
    if (/^\d+$/.test(value)) return 'numeric';
    if (/^[a-zA-Z]+$/.test(value)) return 'alpha';
    return 'mixed';
  }
}