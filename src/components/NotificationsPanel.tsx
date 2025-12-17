import { useState } from 'react';
import { Bell, Check, CheckCheck, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useSecurityViolations, type SecurityViolation } from '@/hooks/useSecurityViolations';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const severityConfig = {
  low: {
    icon: Info,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    label: 'Baixa'
  },
  medium: {
    icon: AlertTriangle,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    label: 'Média'
  },
  high: {
    icon: AlertCircle,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    label: 'Alta'
  },
  critical: {
    icon: AlertCircle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    label: 'Crítica'
  }
};

function ViolationItem({ 
  violation, 
  onMarkAsRead 
}: { 
  violation: SecurityViolation; 
  onMarkAsRead: (id: string) => void;
}) {
  const config = severityConfig[violation.severity] || severityConfig.medium;
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        'p-3 border-b border-border last:border-b-0 transition-colors',
        !violation.read && 'bg-primary/5'
      )}
    >
      <div className="flex gap-3">
        <div className={cn('p-2 rounded-lg shrink-0', config.bg)}>
          <Icon className={cn('h-4 w-4', config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-sm truncate">{violation.policy_name}</p>
            <Badge variant="outline" className={cn('text-xs shrink-0', config.color, config.border)}>
              {config.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {violation.employee_name} - {violation.violation_type}
          </p>
          {violation.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {violation.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(violation.created_at), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
            {!violation.read && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => onMarkAsRead(violation.id)}
              >
                <Check className="h-3 w-3 mr-1" />
                Marcar como lida
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const { violations, loading, unreadCount, markAsRead, markAllAsRead } = useSecurityViolations();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-semibold">Notificações</h3>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas lidas'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Carregando...
            </div>
          ) : violations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            violations.map(violation => (
              <ViolationItem 
                key={violation.id} 
                violation={violation} 
                onMarkAsRead={markAsRead}
              />
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
