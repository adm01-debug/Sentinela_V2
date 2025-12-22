export class HttpService {
  private static instance: HttpService;
  
  static getInstance() {
    if (!this.instance) this.instance = new HttpService();
    return this.instance;
  }
  
  async init() { console.log('http service initialized'); }
}

export const httpService = HttpService.getInstance();