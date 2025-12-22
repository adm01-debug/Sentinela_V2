export class AxiosinstanceService {
  private static instance: AxiosinstanceService;
  
  static getInstance() {
    if (!this.instance) this.instance = new AxiosinstanceService();
    return this.instance;
  }
  
  async init() { console.log('axios-instance service initialized'); }
}

export const axiosinstanceService = AxiosinstanceService.getInstance();