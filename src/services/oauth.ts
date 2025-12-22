export class OauthService {
  private static instance: OauthService;
  
  static getInstance() {
    if (!this.instance) this.instance = new OauthService();
    return this.instance;
  }
  
  async init() { console.log('oauth service initialized'); }
}

export const oauthService = OauthService.getInstance();