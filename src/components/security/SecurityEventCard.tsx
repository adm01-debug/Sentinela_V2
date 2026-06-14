import React from 'react';
import { CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SecurityEvent {
  id: string;
  violation_type: string;
  severity: string;
  employee_name: string;
  policy_name: string;
  description: string | null;
  created_at: string;
  read: boolean;
  device: string | null;
  ip_address: string | null;
}

interface Props {
  event: SecurityEvent;
  onResolve: (id: string) => void;
}

const severityColors = {
  low: 'secondary',
  medium: 'default',
  high: 'destructive',
  critical: 'destructive',
} as const;

export const SecurityEventCard = React.memo(function SecurityEventCard({ event, onResolve }: Props) {
  return (
    <Card className={event.read ? 'opacity-60' : ''}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex gap-2 mb-2">
              <Badge variant={severityColors[event.severity as keyof typeof severityColors] || 'secondary'}>
                {event.severity}
              </Badge>
              <Badge variant="outline">{event.violation_type}</Badge>
            </div>
            <p className="text-sm font-medium">{event.policy_name}</p>
            <p className="text-sm text-muted-foreground">{event.description || 'Sem descrição'}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {event.employee_name}
              {event.ip_address && ` • IP: ${event.ip_address}`}
              {event.device && ` • ${event.device}`}
              {' • '}
              {formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: ptBR })}
            </p>
          </div>
          {!event.read && (
            <Button size="sm" variant="outline" onClick={() => onResolve(event.id)}>
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
