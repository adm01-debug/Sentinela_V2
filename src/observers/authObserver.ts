type AuthCallback = (isAuthenticated: boolean) => void;
class AuthObserver {
  private subscribers: Set<AuthCallback> = new Set();
  subscribe(callback: AuthCallback) { this.subscribers.add(callback); return () => this.subscribers.delete(callback); }
  notify(isAuthenticated: boolean) { this.subscribers.forEach(cb => cb(isAuthenticated)); }
}
export const authObserver = new AuthObserver();
