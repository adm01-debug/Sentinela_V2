export class StorageService {
  private static instance: StorageService;
  
  static getInstance() {
    if (!this.instance) this.instance = new StorageService();
    return this.instance;
  }
  
  async init() { if (import.meta.env.DEV) console.log('storage service initialized'); }
}

export const storageService = StorageService.getInstance();