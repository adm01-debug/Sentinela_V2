export class ValidatorService {
  private static instance: ValidatorService;
  
  static getInstance() {
    if (!this.instance) this.instance = new ValidatorService();
    return this.instance;
  }
  
  async init() { console.log('validator service initialized'); }
}

export const validatorService = ValidatorService.getInstance();