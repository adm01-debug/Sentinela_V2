export class NotificationService {
  private static instance: NotificationService;
  
  static getInstance() {
    if (!this.instance) this.instance = new NotificationService();
    return this.instance;
  }
  
  async init() { console.log('notification service initialized'); }
}

export const notificationService = NotificationService.getInstance();