import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { teamsApi } from '@/api/teams';

export const useTeamsQueryKeys = {
  all: ['teams'] as const,
  lists: () => [...useTeamsQueryKeys.all, 'list'] as const,
  list: (filters: any) => [...useTeamsQueryKeys.lists(), filters] as const,
  details: () => [...useTeamsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...useTeamsQueryKeys.details(), id] as const,
};

export function useTeamsQuery(options?: UseQueryOptions) {
  return useQuery({
    queryKey: useTeamsQueryKeys.all,
    queryFn: () => teamsApi.list(),
    ...options,
  });
}

export function useTeamsQueryById(id: string, options?: UseQueryOptions) {
  return useQuery({
    queryKey: useTeamsQueryKeys.detail(id),
    queryFn: () => teamsApi.get(id),
    enabled: !!id,
    ...options,
  });
}
