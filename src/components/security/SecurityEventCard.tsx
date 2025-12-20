import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SecurityEvent { id: string; type: string; severity: string; ip_address: string; description: string; created_at: string; resolved: boolean; }
interface Props { event: SecurityEvent; onResolve: (id: string) => void; }

const severityColors = { low: 'secondary', medium: 'default', high: 'destructive', critical: 'destructive' } as const;

export const SecurityEventCard = React.memo(function SecurityEventCard({ event, onResolve }: Props) {
  return (
    <Card className={event.resolved ? 'opacity-60' : ''}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex gap-2 mb-2">
              <Badge variant={severityColors[event.severity as keyof typeof severityColors] || 'secondary'}>{event.severity}</Badge>
              <Badge variant="outline">{event.type}</Badge>
            </div>
            <p className="text-sm">{event.description}</p>
            <p className="text-xs text-muted-foreground mt-1">IP: {event.ip_address} • {formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: ptBR })}</p>
          </div>
          {!event.resolved && <Button size="sm" variant="outline" onClick={() => onResolve(event.id)}><CheckCircle className="h-4 w-4" /></Button>}
        </div>
      </CardContent>
    </Card>
  );
});
