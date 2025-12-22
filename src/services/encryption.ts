export class EncryptionService {
  private static instance: EncryptionService;
  
  static getInstance() {
    if (!this.instance) this.instance = new EncryptionService();
    return this.instance;
  }
  
  async init() { console.log('encryption service initialized'); }
}

export const encryptionService = EncryptionService.getInstance();