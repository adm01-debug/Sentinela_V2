export class EmailService {
  private static instance: EmailService;
  
  static getInstance() {
    if (!this.instance) this.instance = new EmailService();
    return this.instance;
  }
  
  async init() { if (import.meta.env.DEV) console.log('email service initialized'); }
}

export const emailService = EmailService.getInstance();