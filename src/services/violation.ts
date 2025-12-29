export class ViolationService {
  private static instance: ViolationService;
  
  static getInstance() {
    if (!this.instance) this.instance = new ViolationService();
    return this.instance;
  }
  
  async init() { if (import.meta.env.DEV) console.log('violation service initialized'); }
}

export const violationService = ViolationService.getInstance();