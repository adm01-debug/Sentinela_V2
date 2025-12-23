import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { authApi } from '@/api/auth';

export const useAuthQueryKeys = {
  all: ['auth'] as const,
  lists: () => [...useAuthQueryKeys.all, 'list'] as const,
  list: (filters: any) => [...useAuthQueryKeys.lists(), filters] as const,
  details: () => [...useAuthQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...useAuthQueryKeys.details(), id] as const,
};

export function useAuthQuery(options?: UseQueryOptions) {
  return useQuery({
    queryKey: useAuthQueryKeys.all,
    queryFn: () => authApi.list(),
    ...options,
  });
}

export function useAuthQueryById(id: string, options?: UseQueryOptions) {
  return useQuery({
    queryKey: useAuthQueryKeys.detail(id),
    queryFn: () => authApi.get(id),
    enabled: !!id,
    ...options,
  });
}
