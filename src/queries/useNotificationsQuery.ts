import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '@/api/notifications';

export const useNotificationsQueryKeys = {
  all: ['notifications'] as const,
  list: (f: any) => [...useNotificationsQueryKeys.all, 'list', f] as const,
  detail: (id: string) => [...useNotificationsQueryKeys.all, 'detail', id] as const,
};

export function useNotificationsQuery() {
  return useQuery({ queryKey: useNotificationsQueryKeys.all, queryFn: () => notificationsApi.list() });
}

export function useNotificationsQueryById(id: string) {
  return useQuery({ queryKey: useNotificationsQueryKeys.detail(id), queryFn: () => notificationsApi.get(id), enabled: !!id });
}
