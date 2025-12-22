export class ErrorhandlerService {
  private static instance: ErrorhandlerService;
  
  static getInstance() {
    if (!this.instance) this.instance = new ErrorhandlerService();
    return this.instance;
  }
  
  async init() { console.log('error-handler service initialized'); }
}

export const errorhandlerService = ErrorhandlerService.getInstance();