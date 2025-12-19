import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Pause,
  Play,
  Ban,
  Loader2,
  Circle,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

type StatusType =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'success'
  | 'error'
  | 'warning'
  | 'paused'
  | 'running'
  | 'blocked'
  | 'loading'
  | 'online'
  | 'offline'
  | 'draft'
  | 'published'
  | 'archived';

interface StatusConfig {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  icon: typeof Circle;
  className: string;
}

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ============================================================
// STATUS CONFIGURATIONS
// ============================================================

const statusConfigs: Record<StatusType, StatusConfig> = {
  active: {
    label: 'Ativo',
    variant: 'default',
    icon: CheckCircle,
    className: 'bg-green-500/10 text-green-600 border-green-500/20',
  },
  inactive: {
    label: 'Inativo',
    variant: 'secondary',
    icon: XCircle,
    className: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  },
  pending: {
    label: 'Pendente',
    variant: 'outline',
    icon: Clock,
    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  },
  success: {
    label: 'Sucesso',
    variant: 'default',
    icon: CheckCircle,
    className: 'bg-green-500/10 text-green-600 border-green-500/20',
  },
  error: {
    label: 'Erro',
    variant: 'destructive',
    icon: XCircle,
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
  warning: {
    label: 'Atenção',
    variant: 'outline',
    icon: AlertTriangle,
    className: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  },
  paused: {
    label: 'Pausado',
    variant: 'secondary',
    icon: Pause,
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  running: {
    label: 'Em execução',
    variant: 'default',
    icon: Play,
    className: 'bg-green-500/10 text-green-600 border-green-500/20',
  },
  blocked: {
    label: 'Bloqueado',
    variant: 'destructive',
    icon: Ban,
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
  loading: {
    label: 'Carregando',
    variant: 'outline',
    icon: Loader2,
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  online: {
    label: 'Online',
    variant: 'default',
    icon: Circle,
    className: 'bg-green-500/10 text-green-600 border-green-500/20',
  },
  offline: {
    label: 'Offline',
    variant: 'secondary',
    icon: Circle,
    className: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  },
  draft: {
    label: 'Rascunho',
    variant: 'outline',
    icon: Circle,
    className: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  },
  published: {
    label: 'Publicado',
    variant: 'default',
    icon: CheckCircle,
    className: 'bg-green-500/10 text-green-600 border-green-500/20',
  },
  archived: {
    label: 'Arquivado',
    variant: 'secondary',
    icon: Circle,
    className: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
  lg: 'text-base px-3 py-1',
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
};

// ============================================================
// COMPONENT
// ============================================================

function StatusBadgeComponent({
  status,
  label,
  showIcon = true,
  size = 'md',
  className,
}: StatusBadgeProps) {
  const config = statusConfigs[status];
  const Icon = config.icon;
  const displayLabel = label || config.label;
  const isLoading = status === 'loading';

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border',
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && (
        <Icon
          className={cn(
            iconSizes[size],
            isLoading && 'animate-spin',
            status === 'online' && 'fill-green-500',
            status === 'offline' && 'fill-gray-400'
          )}
        />
      )}
      {displayLabel}
    </Badge>
  );
}

export const StatusBadge = memo(StatusBadgeComponent);

// ============================================================
// SPECIALIZED BADGES
// ============================================================

export const ActiveBadge = memo(({ label }: { label?: string }) => (
  <StatusBadge status="active" label={label} />
));

export const InactiveBadge = memo(({ label }: { label?: string }) => (
  <StatusBadge status="inactive" label={label} />
));

export const PendingBadge = memo(({ label }: { label?: string }) => (
  <StatusBadge status="pending" label={label} />
));

export const ErrorBadge = memo(({ label }: { label?: string }) => (
  <StatusBadge status="error" label={label} />
));

export const OnlineBadge = memo(() => (
  <StatusBadge status="online" showIcon size="sm" />
));

export const OfflineBadge = memo(() => (
  <StatusBadge status="offline" showIcon size="sm" />
));
