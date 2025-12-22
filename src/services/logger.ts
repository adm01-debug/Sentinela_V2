export class LoggerService {
  private static instance: LoggerService;
  
  static getInstance() {
    if (!this.instance) this.instance = new LoggerService();
    return this.instance;
  }
  
  async init() { console.log('logger service initialized'); }
}

export const loggerService = LoggerService.getInstance();