export class IndexeddbService {
  private static instance: IndexeddbService;
  
  static getInstance() {
    if (!this.instance) this.instance = new IndexeddbService();
    return this.instance;
  }
  
  async init() { console.log('indexed-db service initialized'); }
}

export const indexeddbService = IndexeddbService.getInstance();