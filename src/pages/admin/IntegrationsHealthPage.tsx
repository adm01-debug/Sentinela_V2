import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  HeartPulse,
  MessageSquare,
  Hash as SlackIcon,
  Smartphone,
  XCircle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChaosCoverageCard } from '@/components/admin/ChaosCoverageCard';


type HealthLevel = 'ok' | 'warn' | 'down' | 'off';

interface ChannelHealth {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  level: HealthLevel;
  headline: string;
  metrics: Array<{ label: string; value: string | number; tone?: 'default' | 'success' | 'warning' | 'danger' }>;
  lastEvent?: string | null;
  detail?: string;
}

const LEVEL_STYLES: Record<HealthLevel, { badge: string; label: string; ring: string }> = {
  ok: { badge: 'bg-success/15 text-success border-success/30', label: 'Operacional', ring: 'ring-success/30' },
  warn: { badge: 'bg-warning/15 text-warning border-warning/30', label: 'Degradado', ring: 'ring-warning/30' },
  down: { badge: 'bg-destructive/15 text-destructive border-destructive/30', label: 'Fora do ar', ring: 'ring-destructive/30' },
  off: { badge: 'bg-muted text-muted-foreground border-border', label: 'Desabilitado', ring: 'ring-border' },
};

async function loadSlackHealth(): Promise<ChannelHealth> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [integrations, dlq, mttr, logs] = await Promise.all([
    supabase.from('slack_integrations').select('id, name, is_active, auto_paused_at, last_success_at, last_error'),
    supabase.from('slack_notification_dlq').select('id, last_status', { count: 'exact', head: false }).eq('last_status', 0),
    supabase.from('slack_webhook_mttr' as never).select('*').limit(1).maybeSingle(),
    supabase
      .from('edge_function_logs')
      .select('status, created_at, error_message')
      .eq('function_name', 'slack-notify')
      .gte('created_at', since)
      .order('created_at', { ascending: false }),
  ]);

  const rows = integrations.data ?? [];
  const active = rows.filter((r) => r.is_active).length;
  const paused = rows.filter((r) => r.auto_paused_at && new Date(r.auto_paused_at) > new Date()).length;
  const dlqPending = dlq.count ?? 0;
  const logRows = logs.data ?? [];
  const errors = logRows.filter((l) => (l.status ?? 0) >= 400).length;
  const lastEvent = logRows[0]?.created_at ?? rows[0]?.last_success_at ?? null;
  const lastError = rows.find((r) => r.last_error)?.last_error ?? null;
  const p95 = (mttr.data as { p95_minutes?: number } | null)?.p95_minutes ?? null;

  let level: HealthLevel = 'ok';
  let headline = 'Todos os webhooks entregando';
  if (active === 0) {
    level = 'off';
    headline = 'Nenhuma integração Slack ativa';
  } else if (paused > 0 || errors > 0) {
    level = 'down';
    headline = paused > 0 ? `${paused} webhook(s) auto-pausado(s)` : `${errors} falhas nas últimas 24h`;
  } else if (dlqPending > 0 || (p95 !== null && p95 >= 30)) {
    level = 'warn';
    headline = dlqPending > 0 ? `${dlqPending} mensagem(ns) na DLQ` : `MTTR p95 elevado (${p95}min)`;
  }

  return {
    label: 'Slack',
    icon: SlackIcon,
    level,
    headline,
    lastEvent,
    detail: lastError ?? undefined,
    metrics: [
      { label: 'Webhooks ativos', value: active },
      { label: 'Auto-pausados', value: paused, tone: paused > 0 ? 'danger' : 'default' },
      { label: 'DLQ pendente', value: dlqPending, tone: dlqPending > 0 ? 'warning' : 'default' },
      { label: 'MTTR p95', value: p95 !== null ? `${p95}min` : '—' },
      { label: 'Envios 24h', value: logRows.length },
      { label: 'Erros 24h', value: errors, tone: errors > 0 ? 'danger' : 'default' },
    ],
  };
}

async function loadWhatsAppHealth(): Promise<ChannelHealth> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [settings, logs] = await Promise.all([
    supabase.from('whatsapp_notification_settings').select('*').limit(1).maybeSingle(),
    supabase
      .from('whatsapp_message_logs')
      .select('status, created_at, error_message')
      .gte('created_at', since)
      .order('created_at', { ascending: false }),
  ]);

  const enabled = settings.data?.enabled === true;
  const recipients = settings.data?.recipient_numbers?.length ?? 0;
  const rows = logs.data ?? [];
  const sent = rows.filter((r) => r.status === 'sent' || r.status === 'delivered').length;
  const failed = rows.filter((r) => r.status === 'failed' || r.status === 'error').length;
  const lastEvent = rows[0]?.created_at ?? null;
  const lastError = rows.find((r) => r.error_message)?.error_message ?? null;

  let level: HealthLevel = 'ok';
  let headline = 'Mensagens entregues normalmente';
  if (!enabled) {
    level = 'off';
    headline = 'Notificações WhatsApp desabilitadas';
  } else if (recipients === 0) {
    level = 'warn';
    headline = 'Nenhum destinatário configurado';
  } else if (failed > 0 && failed >= sent) {
    level = 'down';
    headline = `${failed} falha(s) nas últimas 24h`;
  } else if (failed > 0) {
    level = 'warn';
    headline = `${failed} falha(s) intermitente(s)`;
  }

  return {
    label: 'WhatsApp',
    icon: MessageSquare,
    level,
    headline,
    lastEvent,
    detail: lastError ?? undefined,
    metrics: [
      { label: 'Status', value: enabled ? 'Ativado' : 'Desativado', tone: enabled ? 'success' : 'default' },
      { label: 'Destinatários', value: recipients },
      { label: 'Entregues 24h', value: sent, tone: sent > 0 ? 'success' : 'default' },
      { label: 'Falhas 24h', value: failed, tone: failed > 0 ? 'danger' : 'default' },
    ],
  };
}

async function loadFcmHealth(): Promise<ChannelHealth> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [devices, logs] = await Promise.all([
    supabase.from('mobile_devices').select('id, push_token', { count: 'exact', head: false }),
    supabase
      .from('edge_function_logs')
      .select('status, created_at, error_message')
      .in('function_name', ['send-push-notification', 'notify-mobile-violation', 'batch-notifications'])
      .gte('created_at', since)
      .order('created_at', { ascending: false }),
  ]);

  const totalDevices = devices.count ?? 0;
  const withToken = (devices.data ?? []).filter((d) => Boolean((d as { push_token?: string }).push_token)).length;
  const rows = logs.data ?? [];
  const sent = rows.filter((l) => (l.status ?? 0) < 400).length;
  const failed = rows.filter((l) => (l.status ?? 0) >= 400).length;
  const lastEvent = rows[0]?.created_at ?? null;
  const lastError = rows.find((r) => r.error_message)?.error_message ?? null;

  let level: HealthLevel = 'ok';
  let headline = 'Push notifications operacionais';
  if (withToken === 0) {
    level = 'off';
    headline = 'Nenhum dispositivo registrado com token FCM';
  } else if (failed > 0 && failed >= sent) {
    level = 'down';
    headline = `${failed} falhas de push nas últimas 24h`;
  } else if (failed > 0) {
    level = 'warn';
    headline = `${failed} falha(s) intermitente(s)`;
  }

  return {
    label: 'FCM / Push Mobile',
    icon: Smartphone,
    level,
    headline,
    lastEvent,
    detail: lastError ?? undefined,
    metrics: [
      { label: 'Dispositivos', value: totalDevices },
      { label: 'Com token', value: withToken, tone: withToken > 0 ? 'success' : 'warning' },
      { label: 'Envios 24h', value: sent },
      { label: 'Falhas 24h', value: failed, tone: failed > 0 ? 'danger' : 'default' },
    ],
  };
}

function toneClass(tone?: 'default' | 'success' | 'warning' | 'danger'): string {
  switch (tone) {
    case 'success': return 'text-success';
    case 'warning': return 'text-warning';
    case 'danger': return 'text-destructive';
    default: return 'text-foreground';
  }
}

function LevelBadge({ level }: { level: HealthLevel }) {
  const style = LEVEL_STYLES[level];
  const Icon = level === 'ok' ? CheckCircle2 : level === 'warn' ? AlertTriangle : level === 'down' ? XCircle : Activity;
  return (
    <Badge variant="outline" className={`gap-1.5 ${style.badge}`}>
      <Icon className="h-3.5 w-3.5" />
      {style.label}
    </Badge>
  );
}

function ChannelCard({ health }: { health: ChannelHealth }) {
  const Icon = health.icon;
  const ring = LEVEL_STYLES[health.level].ring;
  return (
    <Card className={`ring-1 ${ring} transition-all hover:shadow-md`}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-muted p-2.5">
            <Icon className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <CardTitle className="text-base">{health.label}</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">{health.headline}</p>
          </div>
        </div>
        <LevelBadge level={health.level} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {health.metrics.map((m) => (
            <div key={m.label} className="rounded-md border border-border/60 bg-card/50 p-2.5">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={`text-lg font-semibold tabular-nums ${toneClass(m.tone)}`}>{m.value}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/60 pt-3">
          <span>
            Último evento:{' '}
            {health.lastEvent
              ? formatDistanceToNow(new Date(health.lastEvent), { addSuffix: true, locale: ptBR })
              : 'sem registros'}
          </span>
          {health.detail && (
            <span className="truncate max-w-[60%] text-destructive/80" title={health.detail}>
              {health.detail}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function IntegrationsHealthPage() {
  const query = useQuery({
    queryKey: ['integrations-health'],
    queryFn: async () => {
      const [slack, whatsapp, fcm] = await Promise.all([
        loadSlackHealth(),
        loadWhatsAppHealth(),
        loadFcmHealth(),
      ]);
      return { slack, whatsapp, fcm };
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const channels = query.data ? [query.data.slack, query.data.whatsapp, query.data.fcm] : [];
  const summary = channels.reduce(
    (acc, c) => {
      acc[c.level] += 1;
      return acc;
    },
    { ok: 0, warn: 0, down: 0, off: 0 } as Record<HealthLevel, number>,
  );

  return (
    <PageLayout>
      <PageHeader
        title="Saúde de Integrações"
        description="Status em tempo real dos canais de notificação: Slack, WhatsApp e FCM/Push Mobile."
      />

      {query.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="flex flex-wrap items-center gap-4 py-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm"><strong className="tabular-nums">{summary.ok}</strong> operacional</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-sm"><strong className="tabular-nums">{summary.warn}</strong> degradado</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm"><strong className="tabular-nums">{summary.down}</strong> fora do ar</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm"><strong className="tabular-nums">{summary.off}</strong> desabilitado</span>
              </div>
              <span className="ml-auto text-xs text-muted-foreground">Atualiza a cada 30s</span>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {channels.map((c) => (
              <ChannelCard key={c.label} health={c} />
            ))}
          </div>

          <ChaosCoverageCard />

        </>
      )}
    </PageLayout>
  );
}
