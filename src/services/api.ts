import { supabase } from '@/integrations/supabase/client';

class ApiService {
  async get<T>(table: string, query?: Record<string, unknown>): Promise<T[]> {
    let request = supabase.from(table).select('*');
    
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        request = request.eq(key, value);
      });
    }
    
    const { data, error } = await request;
    if (error) throw error;
    return data as T[];
  }

  async getById<T>(table: string, id: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as T;
  }

  async create<T>(table: string, payload: Partial<T>): Promise<T> {
    const { data, error } = await supabase
      .from(table)
      .insert(payload)
      .select()
      .single();
    
    if (error) throw error;
    return data as T;
  }

  async update<T>(table: string, id: string, payload: Partial<T>): Promise<T> {
    const { data, error } = await supabase
      .from(table)
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as T;
  }

  async delete(table: string, id: string): Promise<void> {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  async callFunction<T>(name: string, payload?: unknown): Promise<T> {
    const { data, error } = await supabase.functions.invoke(name, {
      body: payload,
    });
    
    if (error) throw error;
    return data as T;
  }
}

export const apiService = new ApiService();
