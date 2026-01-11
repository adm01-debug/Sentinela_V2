import { useAlerts } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

const severityIcons = { low: Info, medium: AlertCircle, high: AlertTriangle, critical: AlertTriangle };
const severityVariants: Record<string, 'default' | 'warning' | 'destructive'> = { low: 'default', medium: 'warning', high: 'destructive', critical: 'destructive' };

export const RecentAlerts = () => {
  const { data: alerts } = useAlerts({ acknowledged: false });
  const recentAlerts = alerts?.data.slice(0, 5) || [];

  return (
    <Card>
      <CardHeader><CardTitle>Recent Alerts</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentAlerts.map(alert => {
            const Icon = severityIcons[alert.severity];
            return (
              <div key={alert.id} className="flex items-start gap-3">
                <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{alert.title}</span>
                    <Badge variant={severityVariants[alert.severity]}>{alert.severity}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};