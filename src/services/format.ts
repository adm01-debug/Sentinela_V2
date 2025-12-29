export class FormatService {
  private static instance: FormatService;
  
  static getInstance() {
    if (!this.instance) this.instance = new FormatService();
    return this.instance;
  }
  
  async init() { if (import.meta.env.DEV) console.log('format service initialized'); }
}

export const formatService = FormatService.getInstance();