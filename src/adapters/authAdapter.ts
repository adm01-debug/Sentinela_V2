export interface AuthConfig {
  provider: 'supabase' | 'firebase' | 'custom';
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role?: string;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}

export class AuthAdapter {
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  async login(email: string, password: string): Promise<AuthResult> {
    // Implementation depends on provider
    return {
      token: 'mock-token',
      user: { id: '1', email },
    };
  }

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
  }

  async getUser(): Promise<AuthUser | null> {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    // Validate token and return user
    return null;
  }

  async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return null;
    // Refresh token logic
    return null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }
}

export const authAdapter = new AuthAdapter({ provider: 'supabase' });
