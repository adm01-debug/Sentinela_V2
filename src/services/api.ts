import { supabase } from '@/lib/supabase';

export const api = {
  async get<T>(path: string): Promise<T> {
    const { data, error } = await supabase.functions.invoke(path, { method: 'GET' });
    if (error) throw error;
    return data;
  },
  
  async post<T>(path: string, body?: unknown): Promise<T> {
    const { data, error } = await supabase.functions.invoke(path, { method: 'POST', body });
    if (error) throw error;
    return data;
  },
  
  async put<T>(path: string, body: unknown): Promise<T> {
    const { data, error } = await supabase.functions.invoke(path, { method: 'PUT', body });
    if (error) throw error;
    return data;
  },
  
  async delete<T>(path: string): Promise<T> {
    const { data, error } = await supabase.functions.invoke(path, { method: 'DELETE' });
    if (error) throw error;
    return data;
  },
};
