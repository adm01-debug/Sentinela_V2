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
// STATUS BADGE — 100% semantic tokens
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

// Semantic tone classes — driven by CSS tokens (--success/--warning/--destructive/--info)
const TONE = {
  success: 'bg-success/10 text-success border-success/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  destructive: 'bg-destructive/10 text-destructive border-destructive/30',
  info: 'bg-info/10 text-info border-info/30',
  muted: 'bg-muted text-muted-foreground border-border',
} as const;

const DOT = {
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
  info: 'bg-info',
  muted: 'bg-muted-foreground',
} as const;

const statusConfigs: Record<StatusType, StatusConfig> = {
  active:    { label: 'Ativo',        icon: Activity,    className: TONE.success,     dotColor: DOT.success },
  inactive:  { label: 'Inativo',      icon: Moon,        className: TONE.muted,       dotColor: DOT.muted },
  pending:   { label: 'Pendente',     icon: Clock,       className: TONE.warning,     dotColor: DOT.warning },
  success:   { label: 'Sucesso',      icon: CheckCircle, className: TONE.success,     dotColor: DOT.success },
  error:     { label: 'Erro',         icon: XCircle,     className: TONE.destructive, dotColor: DOT.destructive },
  warning:   { label: 'Alerta',       icon: AlertCircle, className: TONE.warning,     dotColor: DOT.warning },
  info:      { label: 'Info',         icon: AlertCircle, className: TONE.info,        dotColor: DOT.info },
  loading:   { label: 'Carregando',   icon: Loader2,     className: TONE.info,        dotColor: DOT.info },
  paused:    { label: 'Pausado',      icon: Pause,       className: TONE.warning,     dotColor: DOT.warning },
  stopped:   { label: 'Parado',       icon: Ban,         className: TONE.destructive, dotColor: DOT.destructive },
  online:    { label: 'Online',       icon: Wifi,        className: TONE.success,     dotColor: DOT.success },
  offline:   { label: 'Offline',      icon: WifiOff,     className: TONE.muted,       dotColor: DOT.muted },
  visible:   { label: 'Visível',      icon: Eye,         className: TONE.info,        dotColor: DOT.info },
  hidden:    { label: 'Oculto',       icon: EyeOff,      className: TONE.muted,       dotColor: DOT.muted },
  locked:    { label: 'Bloqueado',    icon: Lock,        className: TONE.destructive, dotColor: DOT.destructive },
  unlocked:  { label: 'Desbloqueado', icon: Unlock,      className: TONE.success,     dotColor: DOT.success },
  secure:    { label: 'Seguro',       icon: ShieldCheck, className: TONE.success,     dotColor: DOT.success },
  insecure:  { label: 'Inseguro',     icon: ShieldAlert, className: TONE.destructive, dotColor: DOT.destructive },
  verified:  { label: 'Verificado',   icon: CheckCircle, className: TONE.info,        dotColor: DOT.info },
  idle:      { label: 'Ocioso',       icon: Moon,        className: TONE.muted,       dotColor: DOT.muted },
  busy:      { label: 'Ocupado',      icon: Zap,         className: TONE.warning,     dotColor: DOT.warning },
  default:   { label: 'Padrão',       icon: AlertCircle, className: TONE.muted,       dotColor: DOT.muted },
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
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-destructive',
    info: 'bg-info',
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
