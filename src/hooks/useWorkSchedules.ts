import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, queryPresets, invalidateRelated } from '@/lib/queryClient';

export interface WorkSchedule {
  id: string;
  name: string;
  description?: string;
  work_days?: number[];
  start_time: string;
  end_time: string;
  lunch_start?: string;
  lunch_end?: string;
  break_start?: string;
  break_end?: string;
  flexible_start?: boolean;
  flexible_minutes?: number;
  overtime_allowed?: boolean;
  overtime_requires_approval?: boolean;
  block_outside_hours?: boolean;
  allow_overtime?: boolean;
  auto_block_enabled?: boolean;
  grace_period_minutes?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  company_id?: string;
}

export interface CreateWorkScheduleInput {
  name: string;
  start_time: string;
  end_time: string;
  work_days?: number[];
  description?: string;
  allow_overtime?: boolean;
  auto_block_enabled?: boolean;
  grace_period_minutes?: number;
}

export interface UpdateWorkScheduleInput {
  id: string;
  name?: string;
  start_time?: string;
  end_time?: string;
  work_days?: number[];
  description?: string;
  allow_overtime?: boolean;
  auto_block_enabled?: boolean;
  grace_period_minutes?: number;
}

export function useWorkSchedules() {
  return useQuery({
    queryKey: queryKeys.workSchedules.lists(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_schedules')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as WorkSchedule[];
    },
    ...queryPresets.list,
  });
}

export function useEmployeeSchedule(_employeeId: string | undefined) {
  // work_schedules é um catálogo de turnos por empresa; não existe vínculo
  // direto com employees nas tabelas atuais. Retorna o catálogo ativo.
  return useQuery({
    queryKey: queryKeys.workSchedules.lists(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_schedules')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as WorkSchedule[];
    },
    ...queryPresets.list,
  });
}

export function useCreateWorkSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (input: CreateWorkScheduleInput) => {
      const { data, error } = await supabase.from('work_schedules').insert(input).select().maybeSingle();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelated.workSchedules(queryClient);
      toast({ title: 'Horário criado' });
    },
    onError: (error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateWorkSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateWorkScheduleInput) => {
      const { data, error } = await supabase.from('work_schedules').update(input).eq('id', id).select().maybeSingle();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelated.workSchedules(queryClient);
      toast({ title: 'Horário atualizado' });
    },
    onError: (error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteWorkSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('work_schedules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateRelated.workSchedules(queryClient);
      toast({ title: 'Horário excluído' });
    },
    onError: (error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });
}
