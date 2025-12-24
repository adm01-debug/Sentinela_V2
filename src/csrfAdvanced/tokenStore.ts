import { CSRFToken } from './types';

export class CSRFTokenStore {
  private tokens: Map<string, CSRFToken> = new Map();
  
  save(token: CSRFToken): void { this.tokens.set(token.token, token); }
  get(token: string): CSRFToken | undefined { return this.tokens.get(token); }
  delete(token: string): boolean { return this.tokens.delete(token); }
  
  getBySession(sessionId: string): CSRFToken[] {
    return Array.from(this.tokens.values()).filter(t => t.sessionId === sessionId);
  }
  
  cleanup(): number {
    const now = new Date();
    let removed = 0;
    for (const [token, data] of this.tokens) {
      if (data.expiresAt < now || data.used) {
        this.tokens.delete(token);
        removed++;
      }
    }
    return removed;
  }
  
  revokeSession(sessionId: string): number {
    let revoked = 0;
    for (const [token, data] of this.tokens) {
      if (data.sessionId === sessionId) {
        this.tokens.delete(token);
        revoked++;
      }
    }
    return revoked;
  }
}