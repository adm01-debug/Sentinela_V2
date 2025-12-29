export class ReportService {
  private static instance: ReportService;
  
  static getInstance() {
    if (!this.instance) this.instance = new ReportService();
    return this.instance;
  }
  
  async init() { if (import.meta.env.DEV) console.log('report service initialized'); }
}

export const reportService = ReportService.getInstance();