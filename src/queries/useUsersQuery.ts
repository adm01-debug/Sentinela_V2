import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { usersApi } from '@/api/users';

export const useUsersQueryKeys = {
  all: ['users'] as const,
  lists: () => [...useUsersQueryKeys.all, 'list'] as const,
  list: (filters: any) => [...useUsersQueryKeys.lists(), filters] as const,
  details: () => [...useUsersQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...useUsersQueryKeys.details(), id] as const,
};

export function useUsersQuery(options?: UseQueryOptions) {
  return useQuery({
    queryKey: useUsersQueryKeys.all,
    queryFn: () => usersApi.list(),
    ...options,
  });
}

export function useUsersQueryById(id: string, options?: UseQueryOptions) {
  return useQuery({
    queryKey: useUsersQueryKeys.detail(id),
    queryFn: () => usersApi.get(id),
    enabled: !!id,
    ...options,
  });
}
