export class ViolationService {
  private static instance: ViolationService;
  
  static getInstance() {
    if (!this.instance) this.instance = new ViolationService();
    return this.instance;
  }
  
  async init() { console.log('violation service initialized'); }
}

export const violationService = ViolationService.getInstance();