import { memo, useCallback, useMemo } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  usePendingNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@/hooks/usePendingNotifications';

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    created_at: string;
  };
  onMarkAsRead: (id: string) => void;
}

const NotificationItem = memo(function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const handleClick = useCallback(() => {
    onMarkAsRead(notification.id);
  }, [notification.id, onMarkAsRead]);

  const timeAgo = useMemo(() => {
    return formatDistanceToNow(new Date(notification.created_at), {
      addSuffix: true,
      locale: ptBR,
    });
  }, [notification.created_at]);

  return (
    <DropdownMenuItem
      className="flex flex-col items-start gap-1 p-3 cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex w-full justify-between">
        <span className="font-medium text-sm">{notification.title}</span>
        <span className="text-xs text-muted-foreground">{timeAgo}</span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {notification.message}
      </p>
    </DropdownMenuItem>
  );
});

function NotificationsDropdownComponent() {
  const { data: notifications = [], isLoading } = usePendingNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const handleMarkAsRead = useCallback((id: string) => {
    markAsRead.mutate(id);
  }, [markAsRead]);

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead.mutate();
  }, [markAllAsRead]);

  const displayedNotifications = useMemo(() => {
    return notifications.slice(0, 10);
  }, [notifications]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Carregando...
            </div>
          ) : displayedNotifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhuma notificação
            </div>
          ) : (
            displayedNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const NotificationsDropdown = memo(NotificationsDropdownComponent);
