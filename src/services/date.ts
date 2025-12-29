export class DateService {
  private static instance: DateService;
  
  static getInstance() {
    if (!this.instance) this.instance = new DateService();
    return this.instance;
  }
  
  async init() { if (import.meta.env.DEV) console.log('date service initialized'); }
}

export const dateService = DateService.getInstance();