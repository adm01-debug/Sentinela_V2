import { Token } from './types';

export class TokenVault {
  private tokens: Map<string, { token: Token; original: string }> = new Map();
  
  async store(token: Token, original: string): Promise<void> {
    this.tokens.set(token.value, { token, original });
  }
  
  async retrieve(tokenValue: string): Promise<string | null> {
    const entry = this.tokens.get(tokenValue);
    if (!entry) return null;
    if (entry.token.expiresAt && entry.token.expiresAt < new Date()) {
      this.tokens.delete(tokenValue);
      return null;
    }
    return entry.original;
  }
  
  async revoke(tokenValue: string): Promise<boolean> { return this.tokens.delete(tokenValue); }
  
  async getToken(tokenValue: string): Promise<Token | null> {
    return this.tokens.get(tokenValue)?.token ?? null;
  }
  
  async getTokensByMetadata(key: string, value: string): Promise<Token[]> {
    return Array.from(this.tokens.values())
      .filter(e => e.token.metadata?.[key] === value)
      .map(e => e.token);
  }
  
  async cleanup(): Promise<number> {
    const now = new Date();
    let removed = 0;
    for (const [key, entry] of this.tokens) {
      if (entry.token.expiresAt && entry.token.expiresAt < now) {
        this.tokens.delete(key);
        removed++;
      }
    }
    return removed;
  }
}