import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryPresets } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

/**
 * Conectores SIEM (ADR-008).
 *
 * Os triggers enqueue_siem_event ja entregam eventos em `siem_event_outbox`
 * para todo conector ativo, mas ate agora nao existia nenhuma tela para criar,
 * pausar ou auditar conector -- a fila e o log de entrega tambem eram
 * invisiveis. As tres tabelas tem RLS admin-only.
 */
export type SiemConnectorType =
  "splunk_hec" | "microsoft_sentinel" | "syslog_cef" | "generic_webhook";

export type SiemEventType =
  "security_violation" | "dlp_incident" | "ueba_anomaly" | "auth_event" | "policy_change";

export type SiemOutboxStatus = "pending" | "sent" | "failed" | "dead_letter";

export interface SiemConnector {
  id: string;
  name: string;
  description: string | null;
  connector_type: SiemConnectorType;
  endpoint: string;
  event_filters: SiemEventType[];
  min_severity: string;
  is_active: boolean;
  paused_until: string | null;
  consecutive_failures: number;
  last_success_at: string | null;
  last_error: string | null;
  last_error_at: string | null;
  timeout_ms: number;
  created_at: string;
}

export interface SiemOutboxEntry {
  id: string;
  connector_id: string;
  event_type: SiemEventType;
  source_table: string | null;
  source_id: string | null;
  status: SiemOutboxStatus;
  attempts: number;
  last_error: string | null;
  next_retry_at: string;
  enqueued_at: string;
  sent_at: string | null;
}

export interface SiemDeliveryEntry {
  id: string;
  connector_id: string;
  event_type: SiemEventType | null;
  status: string;
  http_code: number | null;
  latency_ms: number | null;
  error: string | null;
  response_excerpt: string | null;
  delivered_at: string;
}

export const OUTBOX_LIMIT = 200;
export const DELIVERY_LIMIT = 100;
export const PAUSE_MINUTES = 15;

const CONNECTORS_KEY = ["siem_connectors"] as const;
const OUTBOX_KEY = ["siem_event_outbox"] as const;
const DELIVERIES_KEY = ["siem_delivery_log"] as const;

export const CONNECTOR_TYPE_LABEL: Record<SiemConnectorType, string> = {
  splunk_hec: "Splunk HEC",
  microsoft_sentinel: "Microsoft Sentinel",
  syslog_cef: "Syslog (CEF)",
  generic_webhook: "Webhook genérico",
};

export const ENDPOINT_PLACEHOLDER: Record<SiemConnectorType, string> = {
  splunk_hec: "https://splunk.exemplo.com:8088/services/collector/event",
  microsoft_sentinel:
    "https://<workspace>.ods.opinsights.azure.com/api/logs?api-version=2016-04-01",
  syslog_cef: "udp://siem.exemplo.com:514",
  generic_webhook: "https://webhook.exemplo.com/sentinela",
};

export const EVENT_TYPE_LABEL: Record<SiemEventType, string> = {
  security_violation: "Violação de segurança",
  dlp_incident: "Incidente DLP",
  ueba_anomaly: "Anomalia de comportamento",
  auth_event: "Evento de autenticação",
  policy_change: "Mudança de política",
};

export const OUTBOX_STATUS_LABEL: Record<SiemOutboxStatus, string> = {
  pending: "Na fila",
  sent: "Entregue",
  failed: "Falhou",
  dead_letter: "Descartado",
};

export const SEVERITY_OPTIONS = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
  { value: "critical", label: "Crítica" },
] as const;

export function severityLabel(value: string): string {
  return SEVERITY_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

/** Mesmo filtro padrao do banco: violacoes, incidentes DLP e anomalias UEBA. */
export const DEFAULT_EVENT_FILTERS: SiemEventType[] = [
  "security_violation",
  "dlp_incident",
  "ueba_anomaly",
];

export type ConnectorHealth = "active" | "paused" | "failing" | "inactive";

export const HEALTH_LABEL: Record<ConnectorHealth, string> = {
  active: "Ativo",
  paused: "Pausado",
  failing: "Com falha",
  inactive: "Desativado",
};

/**
 * A ordem importa: um conector desativado nao entrega nada, entao ele e
 * "inactive" mesmo se tiver falhas antigas; pausa vence contagem de falhas
 * porque a pausa e intencional.
 */
export function connectorHealth(connector: SiemConnector, now: Date = new Date()): ConnectorHealth {
  if (!connector.is_active) return "inactive";
  if (connector.paused_until) {
    const paused = new Date(connector.paused_until);
    if (!Number.isNaN(paused.getTime()) && paused.getTime() > now.getTime()) return "paused";
  }
  if (connector.consecutive_failures > 0) return "failing";
  return "active";
}

export interface OutboxSummary {
  total: number;
  pending: number;
  sent: number;
  failed: number;
  deadLetter: number;
}

export function summarizeOutbox(entries: SiemOutboxEntry[]): OutboxSummary {
  const summary: OutboxSummary = {
    total: entries.length,
    pending: 0,
    sent: 0,
    failed: 0,
    deadLetter: 0,
  };
  entries.forEach((entry) => {
    if (entry.status === "pending") summary.pending += 1;
    else if (entry.status === "sent") summary.sent += 1;
    else if (entry.status === "failed") summary.failed += 1;
    else if (entry.status === "dead_letter") summary.deadLetter += 1;
  });
  return summary;
}

/** Evento mais antigo ainda na fila — mede o atraso real da entrega. */
export function oldestPending(entries: SiemOutboxEntry[]): SiemOutboxEntry | null {
  const pending = entries.filter((entry) => entry.status === "pending");
  if (pending.length === 0) return null;
  return pending.reduce((oldest, entry) =>
    new Date(entry.enqueued_at).getTime() < new Date(oldest.enqueued_at).getTime() ? entry : oldest
  );
}

export function formatAge(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const seconds = Math.max(0, Math.round((now.getTime() - then) / 1000));
  if (seconds < 60) return "agora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "há 1 dia" : `há ${days} dias`;
}

export interface DeliverySummary {
  total: number;
  success: number;
  failure: number;
  successRate: number;
  averageLatencyMs: number | null;
  failuresLast24h: number;
}

export function summarizeDeliveries(
  entries: SiemDeliveryEntry[],
  now: Date = new Date()
): DeliverySummary {
  let success = 0;
  let failure = 0;
  let latencySum = 0;
  let latencyCount = 0;
  let failuresLast24h = 0;
  const dayAgo = now.getTime() - 24 * 60 * 60 * 1000;

  entries.forEach((entry) => {
    if (entry.status === "success") success += 1;
    else failure += 1;
    if (typeof entry.latency_ms === "number") {
      latencySum += entry.latency_ms;
      latencyCount += 1;
    }
    if (entry.status !== "success") {
      const when = new Date(entry.delivered_at).getTime();
      if (!Number.isNaN(when) && when >= dayAgo) failuresLast24h += 1;
    }
  });

  const total = entries.length;
  return {
    total,
    success,
    failure,
    successRate: total === 0 ? 0 : Math.round((success / total) * 100),
    averageLatencyMs: latencyCount === 0 ? null : Math.round(latencySum / latencyCount),
    failuresLast24h,
  };
}

export function filterConnectors(
  connectors: SiemConnector[],
  term: string,
  onlyActive = false
): SiemConnector[] {
  const needle = term.trim().toLowerCase();
  return connectors.filter((connector) => {
    if (onlyActive && !connector.is_active) return false;
    if (!needle) return true;
    return (
      connector.name.toLowerCase().includes(needle) ||
      connector.endpoint.toLowerCase().includes(needle) ||
      CONNECTOR_TYPE_LABEL[connector.connector_type].toLowerCase().includes(needle)
    );
  });
}

export interface ConnectorFormData {
  name: string;
  description: string;
  connectorType: SiemConnectorType;
  endpoint: string;
  eventFilters: SiemEventType[];
  minSeverity: string;
  timeoutMs: string;
  isActive: boolean;
}

export const EMPTY_CONNECTOR_FORM: ConnectorFormData = {
  name: "",
  description: "",
  connectorType: "generic_webhook",
  endpoint: "",
  eventFilters: DEFAULT_EVENT_FILTERS,
  minSeverity: "low",
  timeoutMs: "5000",
  isActive: true,
};

/** Enderecos aceitos: http(s) para APIs e udp/tcp para syslog CEF. */
const VALID_ENDPOINT = /^(https?|udp|tcp):\/\/.+/i;

export function validateConnectorForm(form: ConnectorFormData): string[] {
  const errors: string[] = [];
  if (!form.name.trim()) errors.push("Informe um nome para o conector.");
  if (!VALID_ENDPOINT.test(form.endpoint.trim())) {
    errors.push("Informe o endereço completo (http://, https://, udp:// ou tcp://).");
  }
  if (form.eventFilters.length === 0) {
    errors.push("Escolha pelo menos um tipo de evento.");
  }
  const timeout = Number(form.timeoutMs);
  if (!Number.isFinite(timeout) || timeout < 1000 || timeout > 60000) {
    errors.push("O tempo limite deve ficar entre 1000 e 60000 ms.");
  }
  return errors;
}

export function formFromConnector(connector: SiemConnector): ConnectorFormData {
  return {
    name: connector.name,
    description: connector.description ?? "",
    connectorType: connector.connector_type,
    endpoint: connector.endpoint,
    eventFilters: connector.event_filters ?? [],
    minSeverity: connector.min_severity,
    timeoutMs: String(connector.timeout_ms),
    isActive: connector.is_active,
  };
}

export function useSIEMPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SiemConnector | null>(null);
  const [formData, setFormData] = useState<ConnectorFormData>(EMPTY_CONNECTOR_FORM);
  const [removing, setRemoving] = useState<SiemConnector | null>(null);
  const [term, setTerm] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);

  const connectorsQuery = useQuery({
    queryKey: CONNECTORS_KEY,
    queryFn: async (): Promise<SiemConnector[]> => {
      const { data, error } = await supabase
        .from("siem_connectors")
        .select(
          "id, name, description, connector_type, endpoint, event_filters, min_severity, is_active, paused_until, consecutive_failures, last_success_at, last_error, last_error_at, timeout_ms, created_at"
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SiemConnector[];
    },
    ...queryPresets.config,
  });

  const outboxQuery = useQuery({
    queryKey: OUTBOX_KEY,
    queryFn: async (): Promise<SiemOutboxEntry[]> => {
      const { data, error } = await supabase
        .from("siem_event_outbox")
        .select(
          "id, connector_id, event_type, source_table, source_id, status, attempts, last_error, next_retry_at, enqueued_at, sent_at"
        )
        .order("enqueued_at", { ascending: false })
        .limit(OUTBOX_LIMIT);
      if (error) throw error;
      return (data ?? []) as SiemOutboxEntry[];
    },
    ...queryPresets.list,
  });

  const deliveriesQuery = useQuery({
    queryKey: DELIVERIES_KEY,
    queryFn: async (): Promise<SiemDeliveryEntry[]> => {
      const { data, error } = await supabase
        .from("siem_delivery_log")
        .select(
          "id, connector_id, event_type, status, http_code, latency_ms, error, response_excerpt, delivered_at"
        )
        .order("delivered_at", { ascending: false })
        .limit(DELIVERY_LIMIT);
      if (error) throw error;
      return (data ?? []) as SiemDeliveryEntry[];
    },
    ...queryPresets.list,
  });

  const invalidate = useCallback(
    (keys: readonly (readonly unknown[])[]) => {
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    },
    [queryClient]
  );

  const connectors = useMemo(() => connectorsQuery.data ?? [], [connectorsQuery.data]);
  const outbox = useMemo(() => outboxQuery.data ?? [], [outboxQuery.data]);
  const deliveries = useMemo(() => deliveriesQuery.data ?? [], [deliveriesQuery.data]);

  const visibleConnectors = useMemo(
    () => filterConnectors(connectors, term, onlyActive),
    [connectors, term, onlyActive]
  );
  const outboxSummary = useMemo(() => summarizeOutbox(outbox), [outbox]);
  const deliverySummary = useMemo(() => summarizeDeliveries(deliveries), [deliveries]);
  const oldest = useMemo(() => oldestPending(outbox), [outbox]);

  const connectorName = useCallback(
    (id: string) =>
      connectors.find((connector) => connector.id === id)?.name ?? "Conector removido",
    [connectors]
  );

  const buildPayload = useCallback((form: ConnectorFormData) => {
    return {
      name: form.name.trim(),
      description: form.description.trim() || null,
      connector_type: form.connectorType,
      endpoint: form.endpoint.trim(),
      event_filters: form.eventFilters,
      min_severity: form.minSeverity,
      timeout_ms: Number(form.timeoutMs),
      is_active: form.isActive,
    };
  }, []);

  const saveMutation = useMutation({
    mutationFn: async ({ form, id }: { form: ConnectorFormData; id?: string }) => {
      const payload = buildPayload(form);
      if (id) {
        const { error } = await supabase.from("siem_connectors").update(payload).eq("id", id);
        if (error) throw error;
        return;
      }
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from("siem_connectors").insert({
        ...payload,
        created_by: userData?.user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: (_result, variables) => {
      invalidate([CONNECTORS_KEY]);
      setDialogOpen(false);
      setEditing(null);
      setFormData(EMPTY_CONNECTOR_FORM);
      toast({
        title: variables.id ? "Conector atualizado" : "Conector criado",
        description: "A fila de eventos passa a considerar esse conector nas próximas violações.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar conector",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("siem_connectors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate([CONNECTORS_KEY, OUTBOX_KEY, DELIVERIES_KEY]);
      setRemoving(null);
      toast({
        title: "Conector removido",
        description: "Os eventos da fila desse conector foram apagados em cascata.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover conector",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const stateMutation = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      const { error } = await supabase.from("siem_connectors").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate([CONNECTORS_KEY]),
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar conector",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleOpenCreate = useCallback(() => {
    setEditing(null);
    setFormData(EMPTY_CONNECTOR_FORM);
    setDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((connector: SiemConnector) => {
    setEditing(connector);
    setFormData(formFromConnector(connector));
    setDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(() => {
    const errors = validateConnectorForm(formData);
    if (errors.length > 0) {
      toast({ title: "Revise o conector", description: errors[0], variant: "destructive" });
      return;
    }
    saveMutation.mutate({ form: formData, id: editing?.id });
  }, [editing, formData, saveMutation, toast]);

  const handleToggleActive = useCallback(
    (connector: SiemConnector) => {
      stateMutation.mutate({
        id: connector.id,
        patch: { is_active: !connector.is_active },
      });
    },
    [stateMutation]
  );

  const handlePause = useCallback(
    (connector: SiemConnector, minutes: number = PAUSE_MINUTES) => {
      const until = new Date(Date.now() + minutes * 60 * 1000).toISOString();
      stateMutation.mutate({ id: connector.id, patch: { paused_until: until } });
    },
    [stateMutation]
  );

  const handleResume = useCallback(
    (connector: SiemConnector) => {
      stateMutation.mutate({
        id: connector.id,
        patch: {
          paused_until: null,
          consecutive_failures: 0,
          last_error: null,
          last_error_at: null,
        },
      });
    },
    [stateMutation]
  );

  const toggleEventFilter = useCallback((eventType: SiemEventType) => {
    setFormData((current) => ({
      ...current,
      eventFilters: current.eventFilters.includes(eventType)
        ? current.eventFilters.filter((item) => item !== eventType)
        : [...current.eventFilters, eventType],
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setTerm("");
    setOnlyActive(false);
  }, []);

  const isLoading = connectorsQuery.isLoading || outboxQuery.isLoading || deliveriesQuery.isLoading;
  const isError = connectorsQuery.isError || outboxQuery.isError || deliveriesQuery.isError;

  const refetchAll = useCallback(() => {
    void connectorsQuery.refetch();
    void outboxQuery.refetch();
    void deliveriesQuery.refetch();
  }, [connectorsQuery, outboxQuery, deliveriesQuery]);

  return {
    connectors: visibleConnectors,
    allConnectors: connectors,
    outbox,
    deliveries,
    outboxSummary,
    deliverySummary,
    oldestPending: oldest,
    connectorName,
    term,
    setTerm,
    onlyActive,
    setOnlyActive,
    hasFilters: Boolean(term || onlyActive),
    clearFilters,
    dialogOpen,
    setDialogOpen,
    editing,
    formData,
    setFormData,
    toggleEventFilter,
    handleOpenCreate,
    handleOpenEdit,
    handleSubmit,
    removing,
    setRemoving,
    handleRemove: () => {
      if (removing) removeMutation.mutate(removing.id);
    },
    handleToggleActive,
    handlePause,
    handleResume,
    isSaving: saveMutation.isPending,
    isRemoving: removeMutation.isPending,
    isLoading,
    isError,
    refetchAll,
  };
}
