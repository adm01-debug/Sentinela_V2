export class ReportService {
  private static instance: ReportService;
  
  static getInstance() {
    if (!this.instance) this.instance = new ReportService();
    return this.instance;
  }
  
  async init() { console.log('report service initialized'); }
}

export const reportService = ReportService.getInstance();