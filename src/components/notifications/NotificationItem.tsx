import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, Trash2, ChevronRight, Info, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

export const typeConfig: Record<NotificationType, { icon: React.ElementType; color: string; bgColor: string }> = {
  info: { icon: Info, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  warning: { icon: AlertTriangle, color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  error: { icon: AlertCircle, color: 'text-destructive', bgColor: 'bg-destructive/10' },
  success: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
};

export const categoryLabels: Record<NotificationCategory, string> = {
  security: 'Segurança',
  system: 'Sistema',
  activity: 'Atividade',
  alert: 'Alertas',
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAction?: (notification: Notification) => void;
}

export function NotificationItem({ notification, onMarkAsRead, onDelete, onAction }: NotificationItemProps) {
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  return (
    <div className={cn('group relative flex gap-3 p-4 border-b transition-colors hover:bg-muted/50', !notification.isRead && 'bg-primary/5')}>
      <div className={cn('p-2 rounded-full shrink-0 h-fit', config.bgColor)}>
        <Icon className={cn('h-4 w-4', config.color)} />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={cn('text-sm font-medium', !notification.isRead && 'font-semibold')}>{notification.title}</p>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{categoryLabels[notification.category]}</Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{notification.message}</p>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!notification.isRead && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMarkAsRead?.(notification.id)} title="Marcar como lida">
                <Check className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete?.(notification.id)} title="Excluir">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">{formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: ptBR })}</span>
          {notification.actionUrl && (
            <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => onAction?.(notification)}>
              {notification.actionLabel || 'Ver mais'}<ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </div>
      {!notification.isRead && <div className="absolute left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />}
    </div>
  );
}
