import { CSRFToken, CSRFConfig } from './types';

export class CSRFTokenManager {
  private tokens: Map<string, CSRFToken> = new Map();
  
  constructor(private config: CSRFConfig) {}
  
  generate(sessionId: string): CSRFToken {
    const token: CSRFToken = {
      token: this.randomToken(),
      sessionId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.config.ttlSeconds * 1000)
    };
    this.tokens.set(token.token, token);
    return token;
  }
  
  validate(token: string, sessionId: string): boolean {
    const stored = this.tokens.get(token);
    if (!stored) return false;
    if (stored.sessionId !== sessionId) return false;
    if (stored.expiresAt < new Date()) { this.tokens.delete(token); return false; }
    return true;
  }
  
  revoke(token: string): void { this.tokens.delete(token); }
  
  cleanup(): number {
    const now = new Date();
    let removed = 0;
    for (const [key, value] of this.tokens) {
      if (value.expiresAt < now) { this.tokens.delete(key); removed++; }
    }
    return removed;
  }
  
  private randomToken(): string { return Array.from({ length: this.config.tokenLength }, () => Math.random().toString(36).charAt(2)).join(''); }
}