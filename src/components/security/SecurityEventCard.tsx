import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Severity = 'low' | 'medium' | 'high' | 'critical';

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

const SEVERITY_VARIANT: Record<Severity, 'secondary' | 'default' | 'destructive'> = {
  low: 'secondary',
  medium: 'default',
  high: 'destructive',
  critical: 'destructive',
};

const SEVERITY_LABEL: Record<Severity, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica',
};

function safeRelativeDate(iso: string): { rel: string; abs: string } | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return {
    rel: formatDistanceToNow(d, { addSuffix: true, locale: ptBR }),
    abs: d.toLocaleString('pt-BR'),
  };
}

export const SecurityEventCard = React.memo(function SecurityEventCard({ event, onResolve }: Props) {
  const severity = (event.severity as Severity) in SEVERITY_VARIANT ? (event.severity as Severity) : 'medium';
  const dateInfo = safeRelativeDate(event.created_at);
  const title = event.policy_name || 'Alerta sem título';

  return (
    <Card className={event.read ? 'opacity-60' : ''} aria-label={`Evento de segurança: ${title}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant={SEVERITY_VARIANT[severity]}>{SEVERITY_LABEL[severity]}</Badge>
              <Badge variant="outline">{event.violation_type}</Badge>
            </div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{event.description || 'Sem descrição'}</p>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="sr-only">Colaborador: </span>
              {event.employee_name}
              {event.ip_address && (
                <>
                  {' • '}
                  <span className="sr-only">IP: </span>IP: {event.ip_address}
                </>
              )}
              {event.device && (
                <>
                  {' • '}
                  <span className="sr-only">Dispositivo: </span>
                  {event.device}
                </>
              )}
              {dateInfo && (
                <>
                  {' • '}
                  <time dateTime={event.created_at} title={dateInfo.abs}>
                    {dateInfo.rel}
                  </time>
                </>
              )}
            </p>
          </div>
          {!event.read && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onResolve(event.id)}
              aria-label={`Marcar "${title}" como resolvido`}
            >
              <CheckCircle className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
