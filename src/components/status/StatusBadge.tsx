import { cn } from '@/utils/cn';

type Status = 'online' | 'offline' | 'away' | 'busy' | 'active' | 'inactive' | 'pending';

interface StatusBadgeProps {
  status: Status;
  showLabel?: boolean;
  className?: string;
}

const statusConfig: Record<Status, { color: string; label: string }> = {
  online: { color: 'bg-green-500', label: 'Online' },
  offline: { color: 'bg-gray-400', label: 'Offline' },
  away: { color: 'bg-yellow-500', label: 'Ausente' },
  busy: { color: 'bg-red-500', label: 'Ocupado' },
  active: { color: 'bg-green-500', label: 'Ativo' },
  inactive: { color: 'bg-gray-400', label: 'Inativo' },
  pending: { color: 'bg-yellow-500', label: 'Pendente' },
};

export function StatusBadge({ status, showLabel = false, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('h-2.5 w-2.5 rounded-full', config.color)} />
      {showLabel && <span className="text-sm">{config.label}</span>}
    </div>
  );
}
