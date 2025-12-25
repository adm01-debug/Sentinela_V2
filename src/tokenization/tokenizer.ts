/**
 * @fileoverview Tokenization implementation
 * @module @sentinela/core/tokenization
 * @version 13.0.0
 */

import * as crypto from 'crypto';

export interface TokenizerConfig {
  preserveFormat?: boolean;
}

export class Tokenizer {
  private vault = new Map<string, string>();
  private reverseVault = new Map<string, string>();

  constructor(private config: TokenizerConfig = {}) {}

  async tokenize(sensitive: string): Promise<string> {
    const existing = this.reverseVault.get(sensitive);
    if (existing) return existing;

    const token = 'tok_' + crypto.randomBytes(16).toString('hex');
    this.vault.set(token, sensitive);
    this.reverseVault.set(sensitive, token);
    return token;
  }

  async detokenize(token: string): Promise<string> {
    const value = this.vault.get(token);
    if (!value) throw new Error('Token not found');
    return value;
  }

  async delete(token: string): Promise<void> {
    const value = this.vault.get(token);
    if (value) this.reverseVault.delete(value);
    this.vault.delete(token);
  }

  clear(): void {
    this.vault.clear();
    this.reverseVault.clear();
  }
}
