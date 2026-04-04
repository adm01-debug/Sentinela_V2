import React, { useState, useMemo, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Filter,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle,
  X,
  ChevronRight,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Types
export type NotificationType = 'info' | 'warning' | 'error' | 'success';
export type NotificationCategory = 'security' | 'system' | 'activity' | 'alert';

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: unknown;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead?: (id) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id) => void;
  onDeleteAll?: () => void;
  onAction?: (notification: Notification) => void;
  onSettingsClick?: () => void;
  soundEnabled?: boolean;
  onSoundToggle?: (enabled: boolean) => void;
}

// Type config
const typeConfig: Record<NotificationType, { icon: React.ElementType; color: string; bgColor: string }> = {
  info: { icon: Info, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  warning: { icon: AlertTriangle, color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  error: { icon: AlertCircle, color: 'text-destructive', bgColor: 'bg-destructive/10' },
  success: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
};

const categoryLabels: Record<NotificationCategory, string> = {
  security: 'Segurança',
  system: 'Sistema',
  activity: 'Atividade',
  alert: 'Alertas',
};

// Single notification item
function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onAction,
}: {
  notification: Notification;
  onMarkAsRead?: (id) => void;
  onDelete?: (id) => void;
  onAction?: (notification: Notification) => void;
}) {
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'group relative flex gap-3 p-4 border-b transition-colors',
        'hover:bg-muted/50',
        !notification.isRead && 'bg-primary/5'
      )}
    >
      {/* Icon */}
      <div className={cn('p-2 rounded-full shrink-0 h-fit', config.bgColor)}>
        <Icon className={cn('h-4 w-4', config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={cn('text-sm font-medium', !notification.isRead && 'font-semibold')}>
                {notification.title}
              </p>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {categoryLabels[notification.category]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
              {notification.message}
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onMarkAsRead?.(notification.id)}
                title="Marcar como lida"
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onDelete?.(notification.id)}
              title="Excluir"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: ptBR })}
          </span>
          
          {notification.actionUrl && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => onAction?.(notification)}
            >
              {notification.actionLabel || 'Ver mais'}
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="absolute left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
      )}
    </div>
  );
}

// Empty state
function EmptyNotifications({ category }: { category?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <BellOff className="h-12 w-12 mb-4 opacity-20" />
      <p className="text-sm font-medium">Nenhuma notificação</p>
      <p className="text-xs mt-1">
        {category ? `Não há notificações de ${category.toLowerCase()}` : 'Você está em dia!'}
      </p>
    </div>
  );
}

// Main NotificationCenter as Sheet
export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onDeleteAll,
  onAction,
  onSettingsClick,
  soundEnabled = true,
  onSoundToggle,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | NotificationCategory>('all');

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications;
    return notifications.filter((n) => n.category === activeTab);
  }, [notifications, activeTab]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: notifications.length };
    notifications.forEach((n) => {
      counts[n.category] = (counts[n.category] || 0) + 1;
    });
    return counts;
  }, [notifications]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
              {unreadCount > 0 && (
                <Badge variant="secondary">{unreadCount} novas</Badge>
              )}
            </SheetTitle>

            <div className="flex items-center gap-1">
              {/* Sound toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onSoundToggle?.(!soundEnabled)}
                title={soundEnabled ? 'Desativar som' : 'Ativar som'}
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>

              {/* More options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onMarkAllAsRead} disabled={unreadCount === 0}>
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Marcar todas como lidas
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onDeleteAll}
                    className="text-destructive focus:text-destructive"
                    disabled={notifications.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar todas
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onSettingsClick}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </SheetHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
            <TabsTrigger
              value="all"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
            >
              Todas
              {categoryCounts.all > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs">
                  {categoryCounts.all}
                </Badge>
              )}
            </TabsTrigger>
            {(Object.keys(categoryLabels) as NotificationCategory[]).map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
              >
                {categoryLabels[category]}
                {(categoryCounts[category] || 0) > 0 && (
                  <Badge variant="secondary" className="ml-1.5 text-xs">
                    {categoryCounts[category]}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="flex-1 m-0">
            <ScrollArea className="h-[calc(100vh-180px)]">
              {filteredNotifications.length === 0 ? (
                <EmptyNotifications category={activeTab !== 'all' ? categoryLabels[activeTab] : undefined} />
              ) : (
                filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                    onDelete={onDelete}
                    onAction={onAction}
                  />
                ))
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

// Compact popover version
export function NotificationPopover({
  notifications,
  onMarkAsRead,
  onViewAll,
  limit = 5,
}: {
  notifications: Notification[];
  onMarkAsRead?: (id) => void;
  onViewAll?: () => void;
  limit?: number;
}) {
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
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} novas
            </Badge>
          )}
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
                <div
                  key={notification.id}
                  className={cn(
                    'flex gap-3 p-3 border-b last:border-0 cursor-pointer hover:bg-muted/50',
                    !notification.isRead && 'bg-primary/5'
                  )}
                  onClick={() => onMarkAsRead?.(notification.id)}
                >
                  <Icon className={cn('h-4 w-4 shrink-0 mt-0.5', config.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{notification.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </ScrollArea>

        {notifications.length > limit && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={onViewAll}
            >
              Ver todas ({notifications.length})
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default NotificationCenter;
