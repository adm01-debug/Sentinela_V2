export interface OAuthConfig { clientId: string; clientSecret: string; redirectUri: string; scope: string[]; }
export interface OAuthTokens { accessToken: string; refreshToken?: string; expiresIn: number; }
export abstract class OAuthProvider {
  protected config: OAuthConfig;
  constructor(config: OAuthConfig) { this.config = config; }
  abstract getAuthUrl(): string;
  abstract exchangeCode(code: string): Promise<OAuthTokens>;
  abstract refreshToken(token: string): Promise<OAuthTokens>;
  abstract getUserInfo(accessToken: string): Promise<any>;
}
