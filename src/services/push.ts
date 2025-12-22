export class PushService {
  private static instance: PushService;
  
  static getInstance() {
    if (!this.instance) this.instance = new PushService();
    return this.instance;
  }
  
  async init() { console.log('push service initialized'); }
}

export const pushService = PushService.getInstance();