export class LocalstorageService {
  private static instance: LocalstorageService;
  
  static getInstance() {
    if (!this.instance) this.instance = new LocalstorageService();
    return this.instance;
  }
  
  async init() { if (import.meta.env.DEV) console.log('local-storage service initialized'); }
}

export const localstorageService = LocalstorageService.getInstance();