export class SupabaseclientService {
  private static instance: SupabaseclientService;
  
  static getInstance() {
    if (!this.instance) this.instance = new SupabaseclientService();
    return this.instance;
  }
  
  async init() { console.log('supabase-client service initialized'); }
}

export const supabaseclientService = SupabaseclientService.getInstance();