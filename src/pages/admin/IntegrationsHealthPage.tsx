import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Hash as SlackIcon,
  Smartphone,
  XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChaosCoverageCard } from "@/components/admin/ChaosCoverageCard";

type HealthLevel = "ok" | "warn" | "down" | "off";

// As unicas edges do repo que enviam push hoje (grep por `push_token`).
const PUSH_FUNCTIONS = [
  "send-push-notification",
  "notify-dispute-decision",
  "escalate-dispute-sla",
];

interface ChannelHealth {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  level: HealthLevel;
  headline: string;
  metrics: Array<{
    label: string;
    value: string | number;
    tone?: "default" | "success" | "warning" | "danger";
  }>;
  lastEvent?: string | null;
  detail?: string;
}

const LEVEL_STYLES: Record<HealthLevel, { badge: string; label: string; ring: string }> = {
  ok: {
    badge: "bg-success/15 text-success border-success/30",
    label: "Operacional",
    ring: "ring-success/30",
  },
  warn: {
    badge: "bg-warning/15 text-warning border-warning/30",
    label: "Degradado",
    ring: "ring-warning/30",
  },
  down: {
    badge: "bg-destructive/15 text-destructive border-destructive/30",
    label: "Fora do ar",
    ring: "ring-destructive/30",
  },
  off: {
    badge: "bg-muted text-muted-foreground border-border",
    label: "Desabilitado",
    ring: "ring-border",
  },
};

async function loadSlackHealth(): Promise<ChannelHealth> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [integrations, dlq, mttr, logs] = await Promise.all([
    supabase
      .from("slack_integrations")
      .select("id, name, is_active, auto_paused_at, last_success_at, last_error"),
    supabase
      .from("slack_notification_dlq")
      .select("id, last_status", { count: "exact", head: false })
      .eq("last_status", 0),
    supabase
      .from("slack_webhook_mttr" as never)
      .select("*")
      .limit(1)
      .maybeSingle(),
    supabase
      .from("edge_function_logs")
      .select("status, created_at, error_message")
      .eq("function_name", "slack-notify")
      .gte("created_at", since)
      .order("created_at", { ascending: false }),
  ]);

  const rows = integrations.data ?? [];
  const active = rows.filter((r) => r.is_active).length;
  const paused = rows.filter(
    (r) => r.auto_paused_at && new Date(r.auto_paused_at) > new Date()
  ).length;
  const dlqPending = dlq.count ?? 0;
  const logRows = logs.data ?? [];
  const errors = logRows.filter((l) => (l.status ?? 0) >= 400).length;
  const lastEvent = logRows[0]?.created_at ?? rows[0]?.last_success_at ?? null;
  const lastError = rows.find((r) => r.last_error)?.last_error ?? null;
  const p95 = (mttr.data as { p95_minutes?: number } | null)?.p95_minutes ?? null;

  let level: HealthLevel = "ok";
  let headline = "Todos os webhooks entregando";
  if (active === 0) {
    level = "off";
    headline = "Nenhuma integração Slack ativa";
  } else if (paused > 0 || errors > 0) {
    level = "down";
    headline =
      paused > 0 ? `${paused} webhook(s) auto-pausado(s)` : `${errors} falhas nas últimas 24h`;
  } else if (dlqPending > 0 || (p95 !== null && p95 >= 30)) {
    level = "warn";
    headline =
      dlqPending > 0 ? `${dlqPending} mensagem(ns) na DLQ` : `MTTR p95 elevado (${p95}min)`;
  }

  return {
    label: "Slack",
    icon: SlackIcon,
    level,
    headline,
    lastEvent,
    detail: lastError ?? undefined,
    metrics: [
      { label: "Webhooks ativos", value: active },
      { label: "Auto-pausados", value: paused, tone: paused > 0 ? "danger" : "default" },
      { label: "DLQ pendente", value: dlqPending, tone: dlqPending > 0 ? "warning" : "default" },
      { label: "MTTR p95", value: p95 !== null ? `${p95}min` : "—" },
      { label: "Envios 24h", value: logRows.length },
      { label: "Erros 24h", value: errors, tone: errors > 0 ? "danger" : "default" },
    ],
  };
}

async function loadWhatsAppHealth(): Promise<ChannelHealth> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [settings, logs] = await Promise.all([
    supabase.from("whatsapp_notification_settings").select("*").limit(1).maybeSingle(),
    supabase
      .from("whatsapp_message_logs")
      .select("status, created_at, error_message")
      .gte("created_at", since)
      .order("created_at", { ascending: false }),
  ]);

  const enabled = settings.data?.enabled === true;
  const recipients = settings.data?.recipient_numbers?.length ?? 0;
  const rows = logs.data ?? [];
  const sent = rows.filter((r) => r.status === "sent" || r.status === "delivered").length;
  const failed = rows.filter((r) => r.status === "failed" || r.status === "error").length;
  const lastEvent = rows[0]?.created_at ?? null;
  const lastError = rows.find((r) => r.error_message)?.error_message ?? null;

  let level: HealthLevel = "ok";
  let headline = "Mensagens entregues normalmente";
  if (!enabled) {
    level = "off";
    headline = "Notificações WhatsApp desabilitadas";
  } else if (recipients === 0) {
    level = "warn";
    headline = "Nenhum destinatário configurado";
  } else if (failed > 0 && failed >= sent) {
    level = "down";
    headline = `${failed} falha(s) nas últimas 24h`;
  } else if (failed > 0) {
    level = "warn";
    headline = `${failed} falha(s) intermitente(s)`;
  }

  return {
    label: "WhatsApp",
    icon: MessageSquare,
    level,
    headline,
    lastEvent,
    detail: lastError ?? undefined,
    metrics: [
      {
        label: "Status",
        value: enabled ? "Ativado" : "Desativado",
        tone: enabled ? "success" : "default",
      },
      { label: "Destinatários", value: recipients },
      { label: "Entregues 24h", value: sent, tone: sent > 0 ? "success" : "default" },
      { label: "Falhas 24h", value: failed, tone: failed > 0 ? "danger" : "default" },
    ],
  };
}

/**
 * A edge esta publicada? Mesma semantica do workflow `prune-edge-functions.yml`:
 * o gateway responde 404 para function fora do ar e outro status (401/200) para
 * function viva. Sem isso o painel so olha logs antigos e mostra canal saudavel
 * mesmo depois de a funcao ser removida (foi o caso de `batch-notifications`).
 */
async function edgePublished(functionName: string): Promise<boolean | null> {
  const base = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const apiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  if (!base) return null;

  try {
    const response = await fetch(`${base.replace(/\/+$/, "")}/functions/v1/${functionName}`, {
      method: "OPTIONS",
      headers: apiKey ? { apikey: apiKey } : undefined,
    });
    return response.status !== 404;
  } catch {
    return null;
  }
}

async function loadFcmHealth(): Promise<ChannelHealth> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [devices, logs, published] = await Promise.all([
    supabase.from("mobile_devices").select("id, push_token", { count: "exact", head: false }),
    supabase
      .from("edge_function_logs")
      .select("status, created_at, error_message")
      .in("function_name", PUSH_FUNCTIONS)
      .gte("created_at", since)
      .order("created_at", { ascending: false }),
    Promise.all(PUSH_FUNCTIONS.map((fn) => edgePublished(fn))),
  ]);

  const missing = PUSH_FUNCTIONS.filter((_, i) => published[i] === false);
  const totalDevices = devices.count ?? 0;
  const withToken = (devices.data ?? []).filter((d) =>
    Boolean((d as { push_token?: string }).push_token)
  ).length;
  const rows = logs.data ?? [];
  const sent = rows.filter((l) => (l.status ?? 0) < 400).length;
  const failed = rows.filter((l) => (l.status ?? 0) >= 400).length;
  const lastEvent = rows[0]?.created_at ?? null;
  const lastError = rows.find((r) => r.error_message)?.error_message ?? null;

  let level: HealthLevel = "ok";
  let headline = "Push notifications operacionais";
  if (missing.length > 0) {
    level = "down";
    headline = `${missing.length} funcao(oes) de push fora do ar: ${missing.join(", ")}`;
  } else if (withToken === 0) {
    level = "off";
    headline = "Nenhum dispositivo registrado com token FCM";
  } else if (failed > 0 && failed >= sent) {
    level = "down";
    headline = `${failed} falhas de push nas últimas 24h`;
  } else if (failed > 0) {
    level = "warn";
    headline = `${failed} falha(s) intermitente(s)`;
  }

  return {
    label: "FCM / Push Mobile",
    icon: Smartphone,
    level,
    headline,
    lastEvent,
    detail:
      missing.length > 0
        ? `Sem resposta no gateway: ${missing.join(", ")}`
        : (lastError ?? undefined),
    metrics: [
      {
        label: "Funcoes publicadas",
        value: `${PUSH_FUNCTIONS.length - missing.length}/${PUSH_FUNCTIONS.length}`,
        tone: missing.length > 0 ? "danger" : "success",
      },
      { label: "Dispositivos", value: totalDevices },
      { label: "Com token", value: withToken, tone: withToken > 0 ? "success" : "warning" },
      { label: "Envios 24h", value: sent },
      { label: "Falhas 24h", value: failed, tone: failed > 0 ? "danger" : "default" },
    ],
  };
}

/**
 * Saude das edges que nao tem canal proprio, mas cuja queda quebra uma
 * funcionalidade (exclusao LGPD, ciencia de violacao, DLP, exportacao).
 * Antes o painel so olhava Slack/WhatsApp/FCM: uma edge apagada so aparecia
 * quando o usuario reclamava.
 */
const CORE_FUNCTIONS: Array<{ name: string; label: string }> = [
  { name: "delete-user-data", label: "Exclusao LGPD" },
  { name: "acknowledge-violation", label: "Ciencia de violacao" },
  { name: "process-violation-alert", label: "Alerta de violacao" },
  { name: "dlp-incident-report", label: "Relato DLP" },
  { name: "export-data", label: "Exportacao de dados" },
];

async function loadEdgesHealth(): Promise<ChannelHealth> {
  const probes = await Promise.all(CORE_FUNCTIONS.map((fn) => edgePublished(fn.name)));
  const down = CORE_FUNCTIONS.filter((_, i) => probes[i] === false);
  const unknown = probes.filter((p) => p === null).length;

  let level: HealthLevel = "ok";
  let headline = "Todas as funcoes essenciais publicadas";
  if (down.length > 0) {
    level = "down";
    headline = `${down.length} funcao(oes) essencial(is) fora do ar`;
  } else if (unknown === CORE_FUNCTIONS.length) {
    level = "warn";
    headline = "Nao foi possivel verificar as funcoes";
  }

  return {
    label: "Funcoes essenciais",
    icon: Activity,
    level,
    headline,
    lastEvent: null,
    detail:
      down.length > 0
        ? `Sem resposta no gateway: ${down.map((f) => f.name).join(", ")}`
        : undefined,
    metrics: [
      {
        label: "Publicadas",
        value: `${CORE_FUNCTIONS.length - down.length - unknown}/${CORE_FUNCTIONS.length}`,
        tone: down.length > 0 ? "danger" : "success",
      },
      { label: "Fora do ar", value: down.length, tone: down.length > 0 ? "danger" : "default" },
      { label: "Sem verificacao", value: unknown, tone: unknown > 0 ? "warning" : "default" },
    ],
  };
}

function toneClass(tone?: "default" | "success" | "warning" | "danger"): string {
  switch (tone) {
    case "success":
      return "text-success";
    case "warning":
      return "text-warning";
    case "danger":
      return "text-destructive";
    default:
      return "text-foreground";
  }
}

function LevelBadge({ level }: { level: HealthLevel }) {
  const style = LEVEL_STYLES[level];
  const Icon =
    level === "ok"
      ? CheckCircle2
      : level === "warn"
        ? AlertTriangle
        : level === "down"
          ? XCircle
          : Activity;
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
          <div className="bg-muted rounded-lg p-2.5">
            <Icon className="text-foreground h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">{health.label}</CardTitle>
            <p className="text-muted-foreground mt-0.5 text-sm">{health.headline}</p>
          </div>
        </div>
        <LevelBadge level={health.level} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {health.metrics.map((m) => (
            <div key={m.label} className="border-border/60 bg-card/50 rounded-md border p-2.5">
              <p className="text-muted-foreground text-xs">{m.label}</p>
              <p className={`text-lg font-semibold tabular-nums ${toneClass(m.tone)}`}>{m.value}</p>
            </div>
          ))}
        </div>
        <div className="text-muted-foreground border-border/60 flex items-center justify-between border-t pt-3 text-xs">
          <span>
            Último evento:{" "}
            {health.lastEvent
              ? formatDistanceToNow(new Date(health.lastEvent), { addSuffix: true, locale: ptBR })
              : "sem registros"}
          </span>
          {health.detail && (
            <span className="text-destructive/80 max-w-[60%] truncate" title={health.detail}>
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
    queryKey: ["integrations-health"],
    queryFn: async () => {
      const [slack, whatsapp, fcm, edges] = await Promise.all([
        loadSlackHealth(),
        loadWhatsAppHealth(),
        loadFcmHealth(),
        loadEdgesHealth(),
      ]);
      return { slack, whatsapp, fcm, edges };
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const channels = query.data
    ? [query.data.slack, query.data.whatsapp, query.data.fcm, query.data.edges]
    : [];
  const summary = channels.reduce(
    (acc, c) => {
      acc[c.level] += 1;
      return acc;
    },
    { ok: 0, warn: 0, down: 0, off: 0 } as Record<HealthLevel, number>
  );

  return (
    <PageLayout>
      <PageHeader
        title="Saúde de Integrações"
        description="Status em tempo real dos canais de notificação: Slack, WhatsApp e FCM/Push Mobile."
      />

      {query.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="flex flex-wrap items-center gap-4 py-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-success h-4 w-4" />
                <span className="text-sm">
                  <strong className="tabular-nums">{summary.ok}</strong> operacional
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-warning h-4 w-4" />
                <span className="text-sm">
                  <strong className="tabular-nums">{summary.warn}</strong> degradado
                </span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="text-destructive h-4 w-4" />
                <span className="text-sm">
                  <strong className="tabular-nums">{summary.down}</strong> fora do ar
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="text-muted-foreground h-4 w-4" />
                <span className="text-sm">
                  <strong className="tabular-nums">{summary.off}</strong> desabilitado
                </span>
              </div>
              <span className="text-muted-foreground ml-auto text-xs">Atualiza a cada 30s</span>
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
