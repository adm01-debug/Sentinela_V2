export class CryptoService {
  private static instance: CryptoService;
  
  static getInstance() {
    if (!this.instance) this.instance = new CryptoService();
    return this.instance;
  }
  
  async init() { console.log('crypto service initialized'); }
}

export const cryptoService = CryptoService.getInstance();