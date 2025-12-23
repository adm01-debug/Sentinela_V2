export interface AuthConfig { provider: 'supabase' | 'firebase' | 'custom'; }
export class AuthAdapter {
  private config: AuthConfig;
  constructor(config: AuthConfig) { this.config = config; }
  async login(email: string, password: string): Promise<{ token: string; user: any }> { return { token: 'mock-token', user: { email } }; }
  async logout(): Promise<void> { localStorage.removeItem('auth_token'); }
  async getUser(): Promise<any | null> { const token = localStorage.getItem('auth_token'); return token ? { token } : null; }
  isAuthenticated(): boolean { return !!localStorage.getItem('auth_token'); }
}
export const createAuthAdapter = (config: AuthConfig) => new AuthAdapter(config);
