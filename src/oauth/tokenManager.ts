import { OAuthTokens } from './oauthProvider';
export class TokenManager {
  private tokens = new Map<string, OAuthTokens & { expiresAt: number }>();
  store(provider: string, tokens: OAuthTokens): void { this.tokens.set(provider, { ...tokens, expiresAt: Date.now() + tokens.expiresIn * 1000 }); }
  get(provider: string): OAuthTokens | null { const token = this.tokens.get(provider); if (!token) return null; return { accessToken: token.accessToken, refreshToken: token.refreshToken, expiresIn: token.expiresIn }; }
  isExpired(provider: string): boolean { const token = this.tokens.get(provider); if (!token) return true; return Date.now() >= token.expiresAt - 60000; }
  remove(provider: string): void { this.tokens.delete(provider); }
  clear(): void { this.tokens.clear(); }
}
export const tokenManager = new TokenManager();
