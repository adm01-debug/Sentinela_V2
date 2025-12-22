export class OrganizationService {
  private static instance: OrganizationService;
  
  static getInstance() {
    if (!this.instance) this.instance = new OrganizationService();
    return this.instance;
  }
  
  async init() { console.log('organization service initialized'); }
}

export const organizationService = OrganizationService.getInstance();