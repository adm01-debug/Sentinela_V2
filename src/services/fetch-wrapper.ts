export class FetchwrapperService {
  private static instance: FetchwrapperService;
  
  static getInstance() {
    if (!this.instance) this.instance = new FetchwrapperService();
    return this.instance;
  }
  
  async init() { console.log('fetch-wrapper service initialized'); }
}

export const fetchwrapperService = FetchwrapperService.getInstance();