export class ActivityService {
  private static instance: ActivityService;
  
  static getInstance() {
    if (!this.instance) this.instance = new ActivityService();
    return this.instance;
  }
  
  async init() { console.log('activity service initialized'); }
}

export const activityService = ActivityService.getInstance();