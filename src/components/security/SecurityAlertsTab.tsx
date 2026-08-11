// ============================================================
// Security Alerts Tab
// ============================================================

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Bell, CheckCircle2, Globe, Monitor, Users } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | (string & {});

interface SecurityAlertItem {
  id: string;
  read?: boolean;
  severity?: AlertSeverity;
  title?: string;
  description?: string;
  created_at?: string;
  policy_name?: string;
  violation_type?: string;
  employee_name?: string;
  device?: string;
  ip_address?: string;
}

interface SecurityAlertsTabProps {
  alerts: SecurityAlertItem[];
}

function severityBg(severity?: AlertSeverity): string {
  switch (severity) {
    case 'critical': return 'bg-destructive/15 text-destructive';
    case 'high': return 'bg-destructive/10 text-destructive';
    case 'medium': return 'bg-warning/15 text-warning';
    default: return 'bg-primary/15 text-primary';
  }
}

function severityLabel(severity?: AlertSeverity): string {
  switch (severity) {
    case 'critical': return 'Crítica';
    case 'high': return 'Alta';
    case 'medium': return 'Média';
    case 'low': return 'Baixa';
    default: return severity ?? 'Desconhecida';
  }
}

function severityVariant(severity?: AlertSeverity): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (severity === 'critical' || severity === 'high') return 'destructive';
  if (severity === 'medium') return 'secondary';
  return 'outline';
}

function safeDate(iso?: string): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export const SecurityAlertsTab = React.memo(function SecurityAlertsTab({ alerts }: SecurityAlertsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" aria-hidden="true" />
          Alertas de Segurança
        </CardTitle>
        <CardDescription>Violações e eventos de segurança detectados</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" aria-hidden="true" />
              <p className="text-muted-foreground">Nenhum alerta de segurança</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {alerts.map((alert) => {
                const date = safeDate(alert.created_at);
                const relative = date
                  ? formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
                  : '—';
                const absolute = date
                  ? format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                  : undefined;
                const title = alert.policy_name || alert.title || 'Alerta sem título';
                const description =
                  alert.description ||
                  (alert.violation_type ? `Violação do tipo ${alert.violation_type}` : 'Sem descrição');
                return (
                  <li
                    key={alert.id}
                    className={`flex items-start gap-4 p-3 border rounded-lg ${
                      !alert.read ? 'bg-muted/50 border-primary/30' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-full ${severityBg(alert.severity)}`}>
                      <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{title}</p>
                          {alert.severity && (
                            <Badge variant={severityVariant(alert.severity)}>
                              {severityLabel(alert.severity)}
                            </Badge>
                          )}
                          {!alert.read && <Badge variant="default">Novo</Badge>}
                        </div>
                        <time
                          className="text-sm text-muted-foreground whitespace-nowrap"
                          dateTime={date?.toISOString()}
                          title={absolute}
                        >
                          {relative}
                        </time>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{description}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                        {alert.employee_name && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" aria-hidden="true" />
                            <span className="sr-only">Colaborador: </span>
                            {alert.employee_name}
                          </span>
                        )}
                        {alert.device && (
                          <span className="flex items-center gap-1">
                            <Monitor className="h-3 w-3" aria-hidden="true" />
                            <span className="sr-only">Dispositivo: </span>
                            {alert.device}
                          </span>
                        )}
                        {alert.ip_address && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" aria-hidden="true" />
                            <span className="sr-only">IP: </span>
                            {alert.ip_address}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
});
