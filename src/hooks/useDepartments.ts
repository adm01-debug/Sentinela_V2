import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Department {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  employee_count?: number;
}

export interface CreateDepartmentInput {
  name: string;
  description?: string;
  manager_id?: string;
  parent_id?: string;
}

export interface UpdateDepartmentInput extends Partial<CreateDepartmentInput> {
  id: string;
}

export function useDepartments() {
  const queryClient = useQueryClient();

  const departmentsQuery = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Department[];
    },
  });

  const createDepartment = useMutation({
    mutationFn: async (input: CreateDepartmentInput) => {
      const { data, error } = await supabase
        .from('departments')
        .insert([input])
        .select()
        .single();
      
      if (error) throw error;
      return data as Department;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });

  const updateDepartment = useMutation({
    mutationFn: async ({ id, ...input }: UpdateDepartmentInput) => {
      const { data, error } = await supabase
        .from('departments')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Department;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });

  const deleteDepartment = useMutation({
    mutationFn: async (id: any) => {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });

  return {
    departments: departmentsQuery.data ?? [],
    isLoading: departmentsQuery.isLoading,
    isError: departmentsQuery.isError,
    error: departmentsQuery.error,
    refetch: departmentsQuery.refetch,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };
}

export function useDepartment(id) {
  return useQuery({
    queryKey: ['departments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Department;
    },
    enabled: !!id,
  });
}

export default useDepartments;
