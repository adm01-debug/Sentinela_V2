export class DateService {
  private static instance: DateService;
  
  static getInstance() {
    if (!this.instance) this.instance = new DateService();
    return this.instance;
  }
  
  async init() { console.log('date service initialized'); }
}

export const dateService = DateService.getInstance();