// ============================================================
// Security Session History Tab
// ============================================================

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, Activity, Smartphone, Globe, MapPin } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type LoginEventType = 'login_success' | 'login_failed' | 'new_device' | 'logout' | (string & {});

export interface LoginEvent {
  id: string;
  event_type: LoginEventType;
  ip_address: string | null;
  location: string | null;
  user_agent: string | null;
  created_at: string;
}

interface SessionHistoryTabProps {
  loginEvents: LoginEvent[];
}

const UA_MAX = 80;

function EventIcon({ type }: { type: LoginEventType }) {
  switch (type) {
    case 'login_success': return <CheckCircle2 className="h-5 w-5" aria-hidden="true" />;
    case 'login_failed': return <XCircle className="h-5 w-5" aria-hidden="true" />;
    case 'new_device': return <Smartphone className="h-5 w-5" aria-hidden="true" />;
    default: return <Activity className="h-5 w-5" aria-hidden="true" />;
  }
}

function eventLabel(type: LoginEventType): string {
  switch (type) {
    case 'login_success': return 'Login bem-sucedido';
    case 'login_failed': return 'Tentativa de login falhou';
    case 'new_device': return 'Novo dispositivo detectado';
    case 'logout': return 'Logout';
    default: return String(type);
  }
}

function eventBg(type: LoginEventType): string {
  switch (type) {
    case 'login_success': return 'bg-success/15 text-success';
    case 'login_failed': return 'bg-destructive/15 text-destructive';
    case 'new_device': return 'bg-primary/15 text-primary';
    default: return 'bg-muted text-muted-foreground';
  }
}

function truncateUA(ua: string, max = UA_MAX): string {
  return ua.length > max ? `${ua.slice(0, max)}…` : ua;
}

function safeDate(iso: string): Date | null {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export const SessionHistoryTab = React.memo(function SessionHistoryTab({ loginEvents }: SessionHistoryTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" aria-hidden="true" />
          Histórico de Sessões
        </CardTitle>
        <CardDescription>Eventos de login e atividade da sua conta</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {loginEvents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum evento registrado</p>
          ) : (
            <ul className="space-y-3">
              {loginEvents.map((event) => {
                const date = safeDate(event.created_at);
                const absolute = date ? format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : '—';
                const relative = date
                  ? formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
                  : '';
                return (
                  <li
                    key={event.id}
                    className="flex items-start gap-4 p-3 border rounded-lg"
                  >
                    <div className={`p-2 rounded-full ${eventBg(event.event_type)}`}>
                      <EventIcon type={event.event_type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="font-medium">{eventLabel(event.event_type)}</p>
                        <time
                          className="text-sm text-muted-foreground whitespace-nowrap"
                          dateTime={date?.toISOString()}
                          title={relative}
                        >
                          {absolute}
                        </time>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                        {event.ip_address && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" aria-hidden="true" />
                            <span className="sr-only">IP: </span>
                            {event.ip_address}
                          </span>
                        )}
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" aria-hidden="true" />
                            <span className="sr-only">Localização: </span>
                            {event.location}
                          </span>
                        )}
                      </div>
                      {event.user_agent && (
                        <p
                          className="text-xs text-muted-foreground mt-1 truncate"
                          title={event.user_agent}
                        >
                          {truncateUA(event.user_agent)}
                        </p>
                      )}
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
