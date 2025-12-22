export class RealtimeService {
  private static instance: RealtimeService;
  
  static getInstance() {
    if (!this.instance) this.instance = new RealtimeService();
    return this.instance;
  }
  
  async init() { console.log('realtime service initialized'); }
}

export const realtimeService = RealtimeService.getInstance();