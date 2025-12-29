export class WebsocketService {
  private static instance: WebsocketService;
  
  static getInstance() {
    if (!this.instance) this.instance = new WebsocketService();
    return this.instance;
  }
  
  async init() { if (import.meta.env.DEV) console.log('websocket service initialized'); }
}

export const websocketService = WebsocketService.getInstance();