import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ReportFilters {
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  employeeName?: string;
}

interface GenerateReportParams {
  type?: string;
  summary?: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
}

export const useReports = (filters?: ReportFilters) => {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: async () => {
      const { data, error } = await supabase.from('ai_analysis_reports').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return { data: data || [], total: data?.length || 0 };
    },
  });
};

export const useReport = (id) => {
  return useQuery({
    queryKey: ['report', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('ai_analysis_reports').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ai_analysis_reports').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['reports'] }); },
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: GenerateReportParams) => {
      const { data, error } = await supabase.from('ai_analysis_reports').insert({
        report_type: params.type || 'general',
        summary: params.summary || 'Report generated',
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['reports'] }); },
  });
};

export const useReportTemplates = () => {
  return useQuery({
    queryKey: ['report-templates'],
    queryFn: async () => [] as ReportTemplate[],
  });
};
