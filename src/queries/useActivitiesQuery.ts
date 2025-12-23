import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { activitiesApi } from '@/api/activities';

export const useActivitiesQueryKeys = {
  all: ['activities'] as const,
  lists: () => [...useActivitiesQueryKeys.all, 'list'] as const,
  list: (filters: any) => [...useActivitiesQueryKeys.lists(), filters] as const,
  details: () => [...useActivitiesQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...useActivitiesQueryKeys.details(), id] as const,
};

export function useActivitiesQuery(options?: UseQueryOptions) {
  return useQuery({
    queryKey: useActivitiesQueryKeys.all,
    queryFn: () => activitiesApi.list(),
    ...options,
  });
}

export function useActivitiesQueryById(id: string, options?: UseQueryOptions) {
  return useQuery({
    queryKey: useActivitiesQueryKeys.detail(id),
    queryFn: () => activitiesApi.get(id),
    enabled: !!id,
    ...options,
  });
}
