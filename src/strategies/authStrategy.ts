export interface AuthStrategy { login(credentials: any): Promise<any>; logout(): Promise<void>; refresh(): Promise<any>; isAuthenticated(): boolean; }
export class JWTAuthStrategy implements AuthStrategy {
  private tokenKey = 'auth_token';
  async login(credentials: { email: string; password: string }) { const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) }); const data = await res.json(); localStorage.setItem(this.tokenKey, data.token); return data; }
  async logout() { localStorage.removeItem(this.tokenKey); await fetch('/api/auth/logout', { method: 'POST' }); }
  async refresh() { const res = await fetch('/api/auth/refresh', { method: 'POST' }); const data = await res.json(); localStorage.setItem(this.tokenKey, data.token); return data; }
  isAuthenticated() { return !!localStorage.getItem(this.tokenKey); }
}
