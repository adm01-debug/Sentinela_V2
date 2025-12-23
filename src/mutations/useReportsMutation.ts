import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '@/api/reports';

export function useCreateReports() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: any) => reportsApi.create(data), onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }) });
}

export function useUpdateReports() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: any) => reportsApi.update(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }) });
}

export function useDeleteReports() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => reportsApi.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }) });
}
