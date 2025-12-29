export class RealtimeService {
  private static instance: RealtimeService;
  
  static getInstance() {
    if (!this.instance) this.instance = new RealtimeService();
    return this.instance;
  }
  
  async init() { if (import.meta.env.DEV) console.log('realtime service initialized'); }
}

export const realtimeService = RealtimeService.getInstance();