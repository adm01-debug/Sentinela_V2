import { useDisputeSlaAlerts } from '@/hooks/useDisputeSlaAlerts';
import { cn } from '@/utils/cn';

interface Props {
  collapsed?: boolean;
  className?: string;
}

/**
 * Badge realtime que exibe a quantidade de contestações em risco de estourar o SLA (72h).
 * Não renderiza nada quando não há alertas.
 */
export function SlaAlertsBadge({ collapsed, className }: Props) {
  const { data } = useDisputeSlaAlerts();
  const total = data?.length ?? 0;
  if (total === 0) return null;

  const hasBreached = data!.some((a) => a.severity === 'breached');
  const hasCritical = data!.some((a) => a.severity === 'critical');
  const tone = hasBreached
    ? 'bg-destructive text-destructive-foreground'
    : hasCritical
      ? 'bg-destructive/20 text-destructive'
      : 'bg-warning/20 text-warning';

  if (collapsed) {
    return (
      <span
        className={cn(
          'absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-[hsl(var(--sidebar-background))]',
          hasBreached ? 'bg-destructive' : hasCritical ? 'bg-destructive/70' : 'bg-warning',
          className,
        )}
        aria-label={`${total} alertas de SLA`}
      />
    );
  }

  return (
    <span
      className={cn(
        'ml-auto min-w-[20px] rounded-full px-1.5 text-[10px] font-semibold leading-5 text-center',
        tone,
        className,
      )}
      aria-label={`${total} alertas de SLA`}
    >
      {total > 99 ? '99+' : total}
    </span>
  );
}
