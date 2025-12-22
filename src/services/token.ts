export class TokenService {
  private static instance: TokenService;
  
  static getInstance() {
    if (!this.instance) this.instance = new TokenService();
    return this.instance;
  }
  
  async init() { console.log('token service initialized'); }
}

export const tokenService = TokenService.getInstance();