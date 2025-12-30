import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Loader2,
  Pause,
  Ban,
  Wifi,
  WifiOff,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Zap,
  Moon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// ============================================
// STATUS BADGE
// ============================================

export type StatusType =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'loading'
  | 'paused'
  | 'stopped'
  | 'online'
  | 'offline'
  | 'visible'
  | 'hidden'
  | 'locked'
  | 'unlocked'
  | 'secure'
  | 'insecure'
  | 'verified'
  | 'idle'
  | 'busy'
  | 'default';

interface StatusConfig {
  label: string;
  icon: React.ElementType;
  className: string;
  dotColor: string;
}

const statusConfigs: Record<StatusType, StatusConfig> = {
  active: {
    label: 'Ativo',
    icon: Activity,
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    dotColor: 'bg-green-500',
  },
  inactive: {
    label: 'Inativo',
    icon: Moon,
    className: 'bg-muted text-muted-foreground border-border',
    dotColor: 'bg-muted-foreground',
  },
  pending: {
    label: 'Pendente',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    dotColor: 'bg-yellow-500',
  },
  success: {
    label: 'Sucesso',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    dotColor: 'bg-green-500',
  },
  error: {
    label: 'Erro',
    icon: XCircle,
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    dotColor: 'bg-red-500',
  },
  warning: {
    label: 'Alerta',
    icon: AlertCircle,
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    dotColor: 'bg-yellow-500',
  },
  info: {
    label: 'Info',
    icon: AlertCircle,
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    dotColor: 'bg-blue-500',
  },
  loading: {
    label: 'Carregando',
    icon: Loader2,
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    dotColor: 'bg-blue-500',
  },
  paused: {
    label: 'Pausado',
    icon: Pause,
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    dotColor: 'bg-yellow-500',
  },
  stopped: {
    label: 'Parado',
    icon: Ban,
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    dotColor: 'bg-red-500',
  },
  online: {
    label: 'Online',
    icon: Wifi,
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    dotColor: 'bg-green-500',
  },
  offline: {
    label: 'Offline',
    icon: WifiOff,
    className: 'bg-muted text-muted-foreground border-border',
    dotColor: 'bg-muted-foreground',
  },
  visible: {
    label: 'Visível',
    icon: Eye,
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    dotColor: 'bg-blue-500',
  },
  hidden: {
    label: 'Oculto',
    icon: EyeOff,
    className: 'bg-muted text-muted-foreground border-border',
    dotColor: 'bg-muted-foreground',
  },
  locked: {
    label: 'Bloqueado',
    icon: Lock,
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    dotColor: 'bg-red-500',
  },
  unlocked: {
    label: 'Desbloqueado',
    icon: Unlock,
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    dotColor: 'bg-green-500',
  },
  secure: {
    label: 'Seguro',
    icon: ShieldCheck,
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    dotColor: 'bg-green-500',
  },
  insecure: {
    label: 'Inseguro',
    icon: ShieldAlert,
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    dotColor: 'bg-red-500',
  },
  verified: {
    label: 'Verificado',
    icon: CheckCircle,
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    dotColor: 'bg-blue-500',
  },
  idle: {
    label: 'Ocioso',
    icon: Moon,
    className: 'bg-muted text-muted-foreground border-border',
    dotColor: 'bg-muted-foreground',
  },
  busy: {
    label: 'Ocupado',
    icon: Zap,
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    dotColor: 'bg-orange-500',
  },
  default: {
    label: 'Padrão',
    icon: AlertCircle,
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    dotColor: 'bg-gray-500',
  },
};

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  showIcon?: boolean;
  showDot?: boolean;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

function StatusBadgeComponent({
  status,
  label,
  showIcon = true,
  showDot = false,
  size = 'md',
  pulse = false,
  className,
}: StatusBadgeProps) {
  const config = statusConfigs[status];
  const Icon = config.icon;
  const displayLabel = label || config.label;

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0 h-5',
    md: 'text-xs px-2 py-0.5 h-6',
    lg: 'text-sm px-2.5 py-1 h-7',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1 font-medium border',
        config.className,
        sizeStyles[size],
        className
      )}
    >
      {showDot && (
        <span className={cn(
          'h-1.5 w-1.5 rounded-full shrink-0',
          config.dotColor,
          pulse && 'animate-pulse'
        )} />
      )}
      {showIcon && (
        <Icon className={cn(
          iconSizes[size],
          status === 'loading' && 'animate-spin'
        )} />
      )}
      {displayLabel}
    </Badge>
  );
}

export const StatusBadge = memo(StatusBadgeComponent);

// ============================================
// CONNECTION STATUS
// ============================================

interface ConnectionStatusProps {
  isConnected: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ConnectionStatus({
  isConnected,
  showLabel = true,
  size = 'md',
  className,
}: ConnectionStatusProps) {
  return (
    <StatusBadge
      status={isConnected ? 'online' : 'offline'}
      showIcon={true}
      showDot={false}
      size={size}
      pulse={isConnected}
      label={showLabel ? undefined : ''}
      className={className}
    />
  );
}

// ============================================
// DOT INDICATOR
// ============================================

interface DotIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function DotIndicator({
  status,
  pulse = false,
  size = 'md',
  className,
}: DotIndicatorProps) {
  const colorStyles = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-muted-foreground',
  };

  const sizeStyles = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-3 w-3',
  };

  return (
    <span className={cn('relative flex', sizeStyles[size], className)}>
      {pulse && (
        <span className={cn(
          'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
          colorStyles[status]
        )} />
      )}
      <span className={cn(
        'relative inline-flex rounded-full h-full w-full',
        colorStyles[status]
      )} />
    </span>
  );
}
