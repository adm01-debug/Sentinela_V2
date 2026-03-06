import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Extended type with device info
export interface EmployeeDevice {
  id: string;
  device_name: string;
  device_type: string;
  is_primary: boolean;
}

export interface EmployeeWithDetails {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  position: string | null;
  team_id: string | null;
  status: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  hire_date?: string | null;
  notes?: string | null;
  devices?: EmployeeDevice[];
}

export const useEmployees = (filters?: any) => {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: async () => {
      let query = supabase.from('employees').select('*').order('name');
      if (filters?.department) query = query.eq('department', filters.department);
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.search) query = query.ilike('name', `%${filters.search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('employees').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useEmployeeStats = (id: string, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['employee-stats', id, startDate, endDate],
    queryFn: async () => ({ productivity: 0, activeDays: 0, violations: 0 }),
    enabled: !!id && !!startDate && !!endDate,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase.from('employees').insert(data).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: result, error } = await supabase.from('employees').update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('employees').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); },
  });
};
