import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  filters?: Record<string, unknown>;
  columns?: string[];
  dateRange?: { start: string; end: string };
}

export function useExportData(entityType: string) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (options: ExportOptions) => {
      const { data, error } = await supabase.functions.invoke('export-data', {
        body: { entity_type: entityType, ...options },
      });

      if (error) throw error;
      return data as { url: string; filename: string };
    },
    onSuccess: (data) => {
      // Trigger download
      const link = document.createElement('a');
      link.href = data.url;
      link.download = data.filename;
      link.click();
      
      toast({ title: 'Exportação concluída', description: `Arquivo: ${data.filename}` });
    },
    onError: (error) => {
      toast({ title: 'Erro na exportação', description: error.message, variant: 'destructive' });
    },
  });
}

export function useExportEmployees() {
  return useExportData('employees');
}

export function useExportViolations() {
  return useExportData('violations');
}

export function useExportActivity() {
  return useExportData('activity');
}

export function useExportReport() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ reportType, options }: { reportType: string; options: ExportOptions }) => {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: { report_type: reportType, ...options },
      });

      if (error) throw error;
      return data as { url: string; filename: string };
    },
    onSuccess: (data) => {
      const link = document.createElement('a');
      link.href = data.url;
      link.download = data.filename;
      link.click();
      
      toast({ title: 'Relatório gerado' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao gerar relatório', description: error.message, variant: 'destructive' });
    },
  });
}
