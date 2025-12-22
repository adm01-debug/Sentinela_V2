export class ScreenshotService {
  private static instance: ScreenshotService;
  
  static getInstance() {
    if (!this.instance) this.instance = new ScreenshotService();
    return this.instance;
  }
  
  async init() { console.log('screenshot service initialized'); }
}

export const screenshotService = ScreenshotService.getInstance();