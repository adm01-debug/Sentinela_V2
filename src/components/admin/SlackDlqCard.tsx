import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Zap } from 'lucide-react';
import { AlertOctagon, Inbox, Loader2, RotateCw, Trash2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DlqItem {
  id: string;
  integration_id: string | null;
  event_type: string;
  severity: 'warning' | 'critical' | 'breached';
  title: string;
  message: string;
  last_error: string;
  last_status: number | null;
  attempts: number;
  permanent: boolean;
  created_at: string;
  replayed_at: string | null;
  replay_success: boolean | null;
}

const SEVERITY_VARIANT: Record<DlqItem['severity'], 'default' | 'destructive' | 'secondary'> = {
  warning: 'secondary',
  critical: 'destructive',
  breached: 'destructive',
};

export function SlackDlqCard() {
  const qc = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['slack-dlq'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('slack_notification_dlq')
        .select(
          'id, integration_id, event_type, severity, title, message, last_error, last_status, attempts, permanent, created_at, replayed_at, replay_success',
        )
        .is('replayed_at', null)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as DlqItem[];
    },
  });

  const replayMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke('slack-dlq-replay', {
        body: { dlq_id: id },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Mensagem reenviada com sucesso.');
      qc.invalidateQueries({ queryKey: ['slack-dlq'] });
      qc.invalidateQueries({ queryKey: ['slack-integrations'] });
    },
    onError: (e: Error) => toast.error(`Falha no reenvio: ${e.message}`),
  });

  const bulkReplayMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      const { data, error } = await supabase.functions.invoke('slack-dlq-bulk-replay', {
        body: { integration_id: integrationId },
      });
      if (error) throw error;
      return data as { processed: number; succeeded: number; failed: number };
    },
    onSuccess: (data) => {
      toast.success(
        `Replay em lote concluído: ${data.succeeded}/${data.processed} entregues${
          data.failed > 0 ? ` • ${data.failed} falharam` : ''
        }.`,
      );
      qc.invalidateQueries({ queryKey: ['slack-dlq'] });
      qc.invalidateQueries({ queryKey: ['slack-integrations'] });
    },
    onError: (e: Error) => toast.error(`Falha no lote: ${e.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('slack_notification_dlq').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Item descartado da fila.');
      qc.invalidateQueries({ queryKey: ['slack-dlq'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  useEffect(() => {
    const channel = supabase
      .channel('slack-dlq-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'slack_notification_dlq' },
        () => qc.invalidateQueries({ queryKey: ['slack-dlq'] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Inbox className="h-5 w-5 text-primary" />
          Fila de mensagens não entregues (DLQ)
          {items.length > 0 && (
            <Badge variant="destructive" className="ml-1">
              {items.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Mensagens Slack que falharam permanentemente ou esgotaram tentativas ficam aqui até
          serem reenviadas manualmente. Reative a integração antes de reenviar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ações em lote por integração */}
        {byIntegration.length > 0 && (
          <div className="flex flex-wrap gap-2 rounded-md border border-border bg-muted/30 p-3">
            <span className="text-xs font-medium text-muted-foreground self-center mr-1">
              Reenvio em lote:
            </span>
            {byIntegration.map(([intId, count]) => (
              <Button
                key={intId ?? 'null'}
                variant="secondary"
                size="sm"
                disabled={!intId || bulkReplayMutation.isPending}
                onClick={() => intId && bulkReplayMutation.mutate(intId)}
                className="gap-1.5"
              >
                {bulkReplayMutation.isPending && bulkTarget === intId ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Zap className="h-3.5 w-3.5" />
                )}
                {intId ? `Integração • ${count}` : `Sem integração • ${count}`}
              </Button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando fila…
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            <CheckCircle2 className="h-6 w-6 text-success" />
            Nenhuma mensagem pendente. Fila limpa.
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((it) => (
              <li
                key={it.id}
                className="flex flex-col gap-3 rounded-md border border-border p-4 md:flex-row md:items-start md:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{it.title}</span>
                    <Badge variant={SEVERITY_VARIANT[it.severity]}>{it.severity}</Badge>
                    {it.permanent && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertOctagon className="h-3 w-3" />
                        Falha permanente
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {formatDistanceToNow(new Date(it.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </Badge>
                    <Badge variant="outline">{it.attempts} tentativa(s)</Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{it.message}</p>
                  <p className="mt-1 text-xs text-destructive">
                    {it.last_status ? `HTTP ${it.last_status} • ` : ''}
                    {it.last_error}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => replayMutation.mutate(it.id)}
                    disabled={replayMutation.isPending}
                  >
                    {replayMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCw className="h-4 w-4" />
                    )}
                    Reenviar
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm('Descartar esta mensagem da fila?')) {
                        deleteMutation.mutate(it.id);
                      }
                    }}
                    aria-label="Descartar"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
