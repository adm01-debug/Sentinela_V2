import { AlertTriangle, Clock, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDisputeSlaAlerts, type DisputeSlaAlert } from '@/hooks/useDisputeSlaAlerts';

const SEVERITY_MAP: Record<
  DisputeSlaAlert['severity'],
  { label: string; className: string; icon: typeof AlertTriangle }
> = {
  warning: { label: 'Atenção', className: 'bg-warning/15 text-warning border-warning/30', icon: Clock },
  critical: { label: 'Crítico', className: 'bg-destructive/15 text-destructive border-destructive/30', icon: AlertTriangle },
  breached: { label: 'SLA violado', className: 'bg-destructive text-destructive-foreground', icon: ShieldAlert },
};

export function DisputeSlaAlertsCard() {
  const { data, isLoading } = useDisputeSlaAlerts();
  const alerts = data ?? [];

  if (isLoading || alerts.length === 0) return null;

  const breached = alerts.filter((a) => a.severity === 'breached').length;
  const critical = alerts.filter((a) => a.severity === 'critical').length;
  const warning = alerts.filter((a) => a.severity === 'warning').length;

  return (
    <Card className="border-warning/40">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="h-5 w-5 text-warning" />
            Alertas de SLA de Contestação
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {breached} violado(s) · {critical} crítico(s) · {warning} em atenção
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/dispute-metrics">Ver painel</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.slice(0, 5).map((a) => {
          const meta = SEVERITY_MAP[a.severity];
          const Icon = meta.icon;
          return (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-md border bg-card px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    Contestação #{a.id.slice(0, 8)}
                    {a.category ? ` · ${a.category}` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Aberta há {a.hoursOpen}h ·{' '}
                    {a.hoursUntilBreach <= 0
                      ? `Estourou o SLA há ${Math.abs(a.hoursUntilBreach)}h`
                      : `Restam ${a.hoursUntilBreach}h para o SLA`}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={meta.className}>
                {meta.label}
              </Badge>
            </div>
          );
        })}
        {alerts.length > 5 ? (
          <p className="pt-1 text-center text-xs text-muted-foreground">
            +{alerts.length - 5} outras contestações em risco
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
