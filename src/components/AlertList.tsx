import { Alert } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface Props { alerts: Alert[]; isLoading?: boolean; onAcknowledge: (id: string) => void; }

const severityVariants: Record<string, 'default' | 'warning' | 'destructive'> = { low: 'default', medium: 'warning', high: 'destructive', critical: 'destructive' };

export const AlertList = ({ alerts, isLoading, onAcknowledge }: Props) => {
  if (isLoading) return <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} height={80} />)}</div>;

  return (
    <div className="space-y-4">
      {alerts.map(alert => (
        <div key={alert.id} className="flex items-start justify-between p-4 bg-card rounded-lg">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{alert.title}</span>
              <Badge variant={severityVariants[alert.severity]}>{alert.severity}</Badge>
              {alert.acknowledged && <Badge variant="secondary">Acknowledged</Badge>}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
            <p className="text-xs text-muted-foreground mt-2">{format(new Date(alert.createdAt), 'MMM dd, yyyy HH:mm')}</p>
          </div>
          {!alert.acknowledged && <Button size="sm" onClick={() => onAcknowledge(alert.id)}>Acknowledge</Button>}
        </div>
      ))}
    </div>
  );
};