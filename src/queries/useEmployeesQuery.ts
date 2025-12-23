import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { employeesApi } from '@/api/employees';

export const useEmployeesQueryKeys = {
  all: ['employees'] as const,
  lists: () => [...useEmployeesQueryKeys.all, 'list'] as const,
  list: (filters: any) => [...useEmployeesQueryKeys.lists(), filters] as const,
  details: () => [...useEmployeesQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...useEmployeesQueryKeys.details(), id] as const,
};

export function useEmployeesQuery(options?: UseQueryOptions) {
  return useQuery({
    queryKey: useEmployeesQueryKeys.all,
    queryFn: () => employeesApi.list(),
    ...options,
  });
}

export function useEmployeesQueryById(id: string, options?: UseQueryOptions) {
  return useQuery({
    queryKey: useEmployeesQueryKeys.detail(id),
    queryFn: () => employeesApi.get(id),
    enabled: !!id,
    ...options,
  });
}
