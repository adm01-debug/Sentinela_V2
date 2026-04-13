import { Bell, BellOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { type Notification, typeConfig } from './NotificationItem';

interface NotificationPopoverProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onViewAll?: () => void;
  limit?: number;
}

export function NotificationPopover({ notifications, onMarkAsRead, onViewAll, limit = 5 }: NotificationPopoverProps) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const recentNotifications = notifications.slice(0, limit);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold text-sm">Notificações</h4>
          {unreadCount > 0 && <span className="text-xs text-muted-foreground">{unreadCount} novas</span>}
        </div>
        <ScrollArea className="max-h-80">
          {recentNotifications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <BellOff className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Sem notificações</p>
            </div>
          ) : (
            recentNotifications.map((notification) => {
              const config = typeConfig[notification.type];
              const Icon = config.icon;
              return (
                <div key={notification.id} className={cn('flex gap-3 p-3 border-b last:border-0 cursor-pointer hover:bg-muted/50', !notification.isRead && 'bg-primary/5')} onClick={() => onMarkAsRead?.(notification.id)}>
                  <Icon className={cn('h-4 w-4 shrink-0 mt-0.5', config.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{notification.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: ptBR })}</p>
                  </div>
                  {!notification.isRead && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                </div>
              );
            })
          )}
        </ScrollArea>
        {notifications.length > limit && (
          <div className="p-2 border-t">
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={onViewAll}>Ver todas ({notifications.length})</Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
