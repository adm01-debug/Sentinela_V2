import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportService } from '@/services/reportService';

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
    queryFn: () => reportService.getReports(),
  });
};

export const useReport = (id: string | null | undefined) => {
  return useQuery({
    queryKey: ['report', id],
    queryFn: () => reportService.getReportById(id as string),
    enabled: !!id,
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reportService.deleteReport(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['reports'] }); },
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: GenerateReportParams) => reportService.generateReport(params),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['reports'] }); },
  });
};

export const useReportTemplates = () => {
  return useQuery({
    queryKey: ['report-templates'],
    queryFn: async () => [] as ReportTemplate[],
  });
};
