import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useEmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const employeeQuery = useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      if (!id) throw new Error('Employee ID required');
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const activitiesQuery = useQuery({
    queryKey: ['employee-activities', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('employee_id', id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const violationsQuery = useQuery({
    queryKey: ['employee-violations', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('violations')
        .select('*')
        .eq('employee_id', id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const updateEmployee = useMutation({
    mutationFn: async (updates: any) => {
      if (!id) throw new Error('Employee ID required');
      const { error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      toast({ title: 'Funcionário atualizado' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    },
  });

  return {
    employeeId: id,
    employee: employeeQuery.data,
    activities: activitiesQuery.data || [],
    violations: violationsQuery.data || [],
    isLoading: employeeQuery.isLoading,
    isLoadingActivities: activitiesQuery.isLoading,
    isLoadingViolations: violationsQuery.isLoading,
    error: employeeQuery.error,
    updateEmployee: updateEmployee.mutate,
    isUpdating: updateEmployee.isPending,
    refetch: () => {
      employeeQuery.refetch();
      activitiesQuery.refetch();
      violationsQuery.refetch();
    },
  };
}
