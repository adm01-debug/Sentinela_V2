import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { screenshotsApi } from '@/api/screenshots';

export const useScreenshotsQueryKeys = {
  all: ['screenshots'] as const,
  lists: () => [...useScreenshotsQueryKeys.all, 'list'] as const,
  list: (filters: any) => [...useScreenshotsQueryKeys.lists(), filters] as const,
  details: () => [...useScreenshotsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...useScreenshotsQueryKeys.details(), id] as const,
};

export function useScreenshotsQuery(options?: UseQueryOptions) {
  return useQuery({
    queryKey: useScreenshotsQueryKeys.all,
    queryFn: () => screenshotsApi.list(),
    ...options,
  });
}

export function useScreenshotsQueryById(id: string, options?: UseQueryOptions) {
  return useQuery({
    queryKey: useScreenshotsQueryKeys.detail(id),
    queryFn: () => screenshotsApi.get(id),
    enabled: !!id,
    ...options,
  });
}
