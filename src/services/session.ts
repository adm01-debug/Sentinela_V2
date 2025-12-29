export class SessionService {
  private static instance: SessionService;
  
  static getInstance() {
    if (!this.instance) this.instance = new SessionService();
    return this.instance;
  }
  
  async init() { if (import.meta.env.DEV) console.log('session service initialized'); }
}

export const sessionService = SessionService.getInstance();