export class AuthService {
  private static instance: AuthService;
  
  static getInstance() {
    if (!this.instance) this.instance = new AuthService();
    return this.instance;
  }
  
  async init() { if (import.meta.env.DEV) console.log('auth service initialized'); }
}

export const authService = AuthService.getInstance();