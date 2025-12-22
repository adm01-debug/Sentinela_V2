export class PolicyService {
  private static instance: PolicyService;
  
  static getInstance() {
    if (!this.instance) this.instance = new PolicyService();
    return this.instance;
  }
  
  async init() { console.log('policy service initialized'); }
}

export const policyService = PolicyService.getInstance();