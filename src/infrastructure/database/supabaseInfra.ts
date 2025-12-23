import { supabase } from '@/integrations/supabase/client';
export class SupabaseInfra {
  async query<T>(table: string, query?: any): Promise<T[]> { let q = supabase.from(table).select('*'); if (query?.filters) Object.entries(query.filters).forEach(([k, v]) => q = q.eq(k, v)); const { data, error } = await q; if (error) throw error; return data as T[]; }
  async insert<T>(table: string, data: any): Promise<T> { const { data: result, error } = await supabase.from(table).insert(data).select().single(); if (error) throw error; return result as T; }
  async update<T>(table: string, id: string, data: any): Promise<T> { const { data: result, error } = await supabase.from(table).update(data).eq('id', id).select().single(); if (error) throw error; return result as T; }
  async delete(table: string, id: string): Promise<void> { const { error } = await supabase.from(table).delete().eq('id', id); if (error) throw error; }
}
export const supabaseInfra = new SupabaseInfra();
