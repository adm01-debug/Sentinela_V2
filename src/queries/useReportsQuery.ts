import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api/reports';

export const useReportsQueryKeys = {
  all: ['reports'] as const,
  list: (f: any) => [...useReportsQueryKeys.all, 'list', f] as const,
  detail: (id: string) => [...useReportsQueryKeys.all, 'detail', id] as const,
};

export function useReportsQuery() {
  return useQuery({ queryKey: useReportsQueryKeys.all, queryFn: () => reportsApi.list() });
}

export function useReportsQueryById(id: string) {
  return useQuery({ queryKey: useReportsQueryKeys.detail(id), queryFn: () => reportsApi.get(id), enabled: !!id });
}
