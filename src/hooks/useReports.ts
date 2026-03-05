import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportService } from '@/services';
import type { Report, ReportFilters } from '@/types';

export const useReports = () => {
  return useQuery({ queryKey: ['reports'], queryFn: () => reportService.list() });
};

export const useReport = (id: string) => {
  return useQuery({ queryKey: ['report', id], queryFn: () => reportService.get(id), enabled: !!id, refetchInterval: (query) => (query.state?.data as any)?.status === 'generating' ? 2000 : false });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, filters, format }: { type: Report['type']; filters: ReportFilters; format?: Report['format'] }) =>
      reportService.generate(type, filters, format),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['reports'] }); }
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reportService.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['reports'] }); }
  });
};

export const useReportTemplates = () => {
  return useQuery({ queryKey: ['report-templates'], queryFn: () => reportService.getTemplates() });
};