// API hooks - typed interfaces for Supabase operations
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type EmployeeRow = Database['public']['Tables']['employees']['Row'];
type EmployeeInsert = Database['public']['Tables']['employees']['Insert'];

interface EmployeeQueryParams {
  status?: string;
  department?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export function useLogin() {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
  });
}

export function useEmployees(params?: EmployeeQueryParams) {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: async () => {
      const { data, error, count } = await supabase.from('employees').select('*', { count: 'exact' });
      if (error) throw error;
      return { data: data || [], total: count || 0 };
    },
  });
}

export function useCreateEmployee() {
  return useMutation({
    mutationFn: async (employee: EmployeeInsert) => {
      const { data, error } = await supabase.from('employees').insert(employee).select().single();
      if (error) throw error;
      return data;
    },
  });
}
