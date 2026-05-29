import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, queryPresets, invalidateRelated, REFETCH_INTERVALS } from '@/lib/queryClient';
import { useNotificationsStore } from '@/lib/stores';

export interface PendingNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: unknown;
  read: boolean;
  created_at: string;
}

// Note: Uses local Zustand store since 'notifications' table doesn't exist in DB
export function usePendingNotifications() {
  const { notifications } = useNotificationsStore();
  
  return useQuery({
    queryKey: queryKeys.notifications.pending(),
    queryFn: async (): Promise<PendingNotification[]> => {
      // Transform store notifications to expected format
      return notifications.filter(n => !n.read).map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        created_at: n.createdAt.toISOString(),
      }));
    },
    ...(queryPresets as any).realtime,
    refetchInterval: REFETCH_INTERVALS.FREQUENT,
  });
}

export function useUnreadNotificationsCount() {
  const { unreadCount } = useNotificationsStore();
  
  return useQuery({
    queryKey: queryKeys.notifications.unread(),
    queryFn: async (): Promise<number> => {
      return unreadCount;
    },
    ...(queryPresets as any).realtime,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  const { markAsRead } = useNotificationsStore();

  return useMutation({
    mutationFn: async (id: any) => {
      markAsRead(id);
    },
    onSuccess: () => {
      invalidateRelated.notifications(queryClient);
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { markAllAsRead } = useNotificationsStore();

  return useMutation({
    mutationFn: async () => {
      markAllAsRead();
    },
    onSuccess: () => {
      invalidateRelated.notifications(queryClient);
      toast({ title: 'Notificações marcadas como lidas' });
    },
  });
}
