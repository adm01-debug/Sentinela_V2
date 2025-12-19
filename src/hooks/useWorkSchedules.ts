import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, queryPresets, invalidateRelated } from '@/lib/queryClient';

// ============================================================
// TYPES
// ============================================================

export interface WorkSchedule {
  id: string;
  employee_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    full_name: string;
  };
}

export interface CreateWorkScheduleInput {
  employee_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active?: boolean;
}

export interface UpdateWorkScheduleInput {
  id: string;
  start_time?: string;
  end_time?: string;
  is_active?: boolean;
}

// ============================================================
// QUERIES
// ============================================================

export function useWorkSchedules() {
  return useQuery({
    queryKey: queryKeys.workSchedules.lists(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_schedules')
        .select(`
          *,
          employee:employees(id, full_name)
        `)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data as WorkSchedule[];
    },
    ...queryPresets.list,
  });
}

export function useEmployeeSchedule(employeeId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.workSchedules.employee(employeeId || ''),
    queryFn: async () => {
      if (!employeeId) return [];
      
      const { data, error } = await supabase
        .from('work_schedules')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('is_active', true)
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      return data as WorkSchedule[];
    },
    enabled: !!employeeId,
    ...queryPresets.detail,
  });
}

// ============================================================
// MUTATIONS
// ============================================================

export function useCreateWorkSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateWorkScheduleInput) => {
      const { data, error } = await supabase
        .from('work_schedules')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelated.workSchedules(queryClient);
      toast({
        title: 'Horário criado',
        description: 'O horário de trabalho foi criado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar horário',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateWorkSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateWorkScheduleInput) => {
      const { data, error } = await supabase
        .from('work_schedules')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelated.workSchedules(queryClient);
      toast({
        title: 'Horário atualizado',
        description: 'O horário de trabalho foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar horário',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteWorkSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('work_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      invalidateRelated.workSchedules(queryClient);
      toast({
        title: 'Horário excluído',
        description: 'O horário de trabalho foi excluído com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir horário',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useBulkCreateWorkSchedules() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (schedules: CreateWorkScheduleInput[]) => {
      const { data, error } = await supabase
        .from('work_schedules')
        .insert(schedules)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      invalidateRelated.workSchedules(queryClient);
      toast({
        title: 'Horários criados',
        description: `${data.length} horários foram criados com sucesso.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar horários',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
