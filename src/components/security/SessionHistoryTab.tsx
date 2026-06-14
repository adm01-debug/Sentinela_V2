// ============================================================
// Security Session History Tab
// ============================================================

import React from 'react';
import { CheckCircle2, XCircle, Activity, Smartphone, Globe, MapPin } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export interface LoginEvent {
  id: string;
  event_type: string;
  ip_address: string | null;
  location: string | null;
  user_agent: string | null;
  created_at: string;
}

interface SessionHistoryTabProps {
  loginEvents: LoginEvent[];
}

function EventIcon({ type }: { type: string }) {
  switch (type) {
    case 'login_success': return <CheckCircle2 className="h-5 w-5" />;
    case 'login_failed': return <XCircle className="h-5 w-5" />;
    case 'new_device': return <Smartphone className="h-5 w-5" />;
    default: return <Activity className="h-5 w-5" />;
  }
}

function eventLabel(type: string): string {
  switch (type) {
    case 'login_success': return 'Login bem-sucedido';
    case 'login_failed': return 'Tentativa de login falhou';
    case 'new_device': return 'Novo dispositivo detectado';
    case 'logout': return 'Logout';
    default: return type;
  }
}

function eventBg(type: string): string {
  switch (type) {
    case 'login_success': return 'bg-green-100 text-green-600 dark:bg-green-900/30';
    case 'login_failed': return 'bg-red-100 text-red-600 dark:bg-red-900/30';
    case 'new_device': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30';
    default: return 'bg-muted text-muted-foreground';
  }
}

export const SessionHistoryTab = React.memo(function SessionHistoryTab({ loginEvents }: SessionHistoryTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Histórico de Sessões
        </CardTitle>
        <CardDescription>Eventos de login e atividade da sua conta</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {loginEvents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum evento registrado</p>
          ) : (
            <div className="space-y-3">
              {loginEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-4 p-3 border rounded-lg">
                  <div className={`p-2 rounded-full ${eventBg(event.event_type)}`}>
                    <EventIcon type={event.event_type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{eventLabel(event.event_type)}</p>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(event.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                      {event.ip_address && (
                        <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{event.ip_address}</span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>
                      )}
                    </div>
                    {event.user_agent && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">{event.user_agent.substring(0, 80)}...</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
});
