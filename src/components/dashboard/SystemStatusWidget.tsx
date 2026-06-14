import * as React from 'react';
import { Server, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Service { id: string; name: string; status: 'operational' | 'degraded' | 'down'; latency?: number; uptime?: number; }

export function SystemStatusWidget({ services, className }: { services: Service[]; className?: string }) {
  const statusColors = { operational: 'text-green-500', degraded: 'text-yellow-500', down: 'text-red-500' };
  const statusIcons = { operational: CheckCircle, degraded: AlertTriangle, down: XCircle };
  const overallStatus = services.some(s => s.status === 'down') ? 'down' : services.some(s => s.status === 'degraded') ? 'degraded' : 'operational';

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Server className="h-5 w-5" />System Status</CardTitle>
          <Badge className={cn('capitalize', overallStatus === 'operational' ? 'bg-green-100 text-green-800' : overallStatus === 'degraded' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800')}>{overallStatus}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {services.map(service => {
          const StatusIcon = statusIcons[service.status];
          return (
            <div key={service.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
              <StatusIcon className={cn('h-4 w-4', statusColors[service.status])} />
              <span className="flex-1 text-sm font-medium">{service.name}</span>
              {service.latency !== undefined && <span className="text-xs text-muted-foreground">{service.latency}ms</span>}
              {service.uptime !== undefined && <span className="text-xs text-muted-foreground">{service.uptime}%</span>}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
export default SystemStatusWidget;
