import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, queryPresets, invalidateRelated } from '@/lib/queryClient';

// ============================================================
// TYPES
// ============================================================

export interface ScheduledReport {
  id: string;
  name: string;
  report_type: string;
  schedule: string; // cron expression
  recipients: string[];
  filters?: Record<string, unknown>;
  format: 'pdf' | 'csv' | 'xlsx';
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduledReportInput {
  name: string;
  report_type: string;
  schedule: string;
  recipients: string[];
  filters?: Record<string, unknown>;
  format?: 'pdf' | 'csv' | 'xlsx';
  is_active?: boolean;
}

export interface UpdateScheduledReportInput {
  id: string;
  name?: string;
  schedule?: string;
  recipients?: string[];
  filters?: Record<string, unknown>;
  format?: 'pdf' | 'csv' | 'xlsx';
  is_active?: boolean;
}

// ============================================================
// QUERIES
// ============================================================

export function useScheduledReports() {
  return useQuery({
    queryKey: queryKeys.reports.scheduled(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_reports')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as ScheduledReport[];
    },
    ...queryPresets.list,
  });
}

export function useScheduledReport(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reports.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('scheduled_reports')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ScheduledReport;
    },
    enabled: !!id,
    ...queryPresets.detail,
  });
}

// ============================================================
// MUTATIONS
// ============================================================

export function useCreateScheduledReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateScheduledReportInput) => {
      const { data, error } = await supabase
        .from('scheduled_reports')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelated.reports(queryClient);
      toast({
        title: 'Relatório agendado',
        description: 'O relatório foi agendado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao agendar relatório',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateScheduledReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateScheduledReportInput) => {
      const { data, error } = await supabase
        .from('scheduled_reports')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelated.reports(queryClient);
      toast({
        title: 'Relatório atualizado',
        description: 'O relatório agendado foi atualizado.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar relatório',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteScheduledReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('scheduled_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      invalidateRelated.reports(queryClient);
      toast({
        title: 'Relatório excluído',
        description: 'O relatório agendado foi excluído.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir relatório',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useRunScheduledReport() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke('send-scheduled-report', {
        body: { report_id: id, manual: true },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Relatório executado',
        description: 'O relatório foi gerado e enviado.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao executar relatório',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
