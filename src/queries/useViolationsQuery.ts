import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { violationsApi } from '@/api/violations';

export const useViolationsQueryKeys = {
  all: ['violations'] as const,
  lists: () => [...useViolationsQueryKeys.all, 'list'] as const,
  list: (filters: any) => [...useViolationsQueryKeys.lists(), filters] as const,
  details: () => [...useViolationsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...useViolationsQueryKeys.details(), id] as const,
};

export function useViolationsQuery(options?: UseQueryOptions) {
  return useQuery({
    queryKey: useViolationsQueryKeys.all,
    queryFn: () => violationsApi.list(),
    ...options,
  });
}

export function useViolationsQueryById(id: string, options?: UseQueryOptions) {
  return useQuery({
    queryKey: useViolationsQueryKeys.detail(id),
    queryFn: () => violationsApi.get(id),
    enabled: !!id,
    ...options,
  });
}
