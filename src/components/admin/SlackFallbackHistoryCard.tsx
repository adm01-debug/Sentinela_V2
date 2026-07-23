import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MailCheck, MailX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FallbackLog {
  id: string;
  created_at: string;
  status: number;
  duration_ms: number | null;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
}

export function SlackFallbackHistoryCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['slack-fallback-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('edge_function_logs')
        .select('id, created_at, status, duration_ms, error_message, metadata')
        .eq('function_name', 'slack-notify:fallback')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as FallbackLog[];
    },
    refetchInterval: 60_000,
  });

  const successCount = data?.filter((l) => l.status < 300).length ?? 0;
  const failCount = (data?.length ?? 0) - successCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MailCheck className="h-5 w-5 text-primary" />
          Histórico de Fallback Resend
        </CardTitle>
        <CardDescription>
          Últimas 20 execuções do fallback por e-mail quando o Slack falha.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Badge variant="secondary" className="gap-1">
            <MailCheck className="h-3 w-3 text-success" /> {successCount} entregues
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <MailX className="h-3 w-3 text-destructive" /> {failCount} falhas
          </Badge>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        {!isLoading && (data?.length ?? 0) === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum envio de fallback registrado.</p>
        )}

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {data?.map((log) => {
            const ok = log.status < 300;
            const meta = (log.metadata ?? {}) as {
              fallback?: { delivered?: number; recipients?: number; reason?: string };
            };
            const fb = meta.fallback;
            return (
              <div
                key={log.id}
                className="flex items-start justify-between gap-2 rounded-md border p-2 text-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {ok ? (
                      <MailCheck className="h-4 w-4 text-success flex-shrink-0" />
                    ) : (
                      <MailX className="h-4 w-4 text-destructive flex-shrink-0" />
                    )}
                    <span className="font-medium">
                      {fb?.delivered ?? 0}/{fb?.recipients ?? 0} destinatários
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {fb?.reason ?? 'unknown'}
                    </Badge>
                  </div>
                  {log.error_message && (
                    <p className="text-xs text-destructive mt-1 truncate">{log.error_message}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR })}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
