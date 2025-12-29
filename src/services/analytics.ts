export class AnalyticsService {
  private static instance: AnalyticsService;
  
  static getInstance() {
    if (!this.instance) this.instance = new AnalyticsService();
    return this.instance;
  }
  
  async init() { if (import.meta.env.DEV) console.log('analytics service initialized'); }
}

export const analyticsService = AnalyticsService.getInstance();