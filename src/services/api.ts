export class ApiService {
  private static instance: ApiService;
  
  static getInstance() {
    if (!this.instance) this.instance = new ApiService();
    return this.instance;
  }
  
  async init() { console.log('api service initialized'); }
}

export const apiService = ApiService.getInstance();