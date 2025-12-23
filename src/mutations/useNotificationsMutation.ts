import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/api/notifications';

export function useCreateNotifications() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: any) => notificationsApi.create(data), onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) });
}

export function useUpdateNotifications() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: any) => notificationsApi.update(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) });
}

export function useDeleteNotifications() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => notificationsApi.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) });
}
