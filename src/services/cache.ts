export class CacheService {
  private static instance: CacheService;
  
  static getInstance() {
    if (!this.instance) this.instance = new CacheService();
    return this.instance;
  }
  
  async init() { console.log('cache service initialized'); }
}

export const cacheService = CacheService.getInstance();