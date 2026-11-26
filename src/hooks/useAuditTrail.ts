import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryPresets } from "@/lib/queryClient";

/**
 * Trilha de alterações de cadastro (`audit_logs`).
 *
 * A tabela é escrita pelo trigger `audit_trigger_func` em employees, teams,
 * violation_rules, work_schedules, geofences e webhooks
 * (20251219190000_complete_audit_system.sql:174-201), guarda old_values,
 * new_values e changes, e tem SELECT admin-only (mesma migration, :45-56).
 * Nenhuma tela lia -- o gestor não conseguia responder "quem mudou esta escala".
 */
export const AUDIT_TRAIL_LIMIT = 200;

export interface AuditEntry {
  id: string;
  user_email: string | null;
  user_role: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  changes: Record<string, unknown> | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  description: string | null;
  module: string | null;
  severity: string;
  created_at: string;
}

export const AUDIT_QUERY_KEY = ["audit-trail"] as const;

export const AUDIT_ACTIONS = ["create", "update", "delete", "view", "export"] as const;

const ACTION_LABEL: Record<string, string> = {
  create: "Criação",
  update: "Alteração",
  delete: "Exclusão",
  view: "Visualização",
  export: "Exportação",
  login: "Login",
  logout: "Logout",
};

const ENTITY_LABEL: Record<string, string> = {
  employees: "Funcionário",
  teams: "Time",
  violation_rules: "Regra de violação",
  work_schedules: "Escala de trabalho",
  geofences: "Cerca virtual",
  webhooks: "Webhook",
};

export function actionLabel(action: string): string {
  return ACTION_LABEL[action] || action;
}

export function entityLabel(entityType: string): string {
  return ENTITY_LABEL[entityType] || entityType;
}

const SEVERITY_LABEL: Record<string, string> = {
  info: "Informativa",
  warning: "Atenção",
  critical: "Crítica",
};

export function severityLabel(severity: string): string {
  return SEVERITY_LABEL[severity] || severity;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

/** Campos alterados: `changes` quando o trigger preenche, senao diff de old/new. */
export function changedFields(entry: AuditEntry): string[] {
  const changes = asRecord(entry.changes);
  if (changes) {
    const keys = Object.keys(changes).filter((key) => !key.startsWith("_"));
    if (keys.length > 0) return keys.sort();
  }
  const before = asRecord(entry.old_values);
  const after = asRecord(entry.new_values);
  if (!before || !after) return [];
  return Object.keys(after)
    .filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]))
    .sort();
}

export interface FieldDiff {
  field: string;
  from: string;
  to: string;
}

function stringify(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

export function diffValues(entry: AuditEntry): FieldDiff[] {
  const before = asRecord(entry.old_values) ?? {};
  const after = asRecord(entry.new_values) ?? {};
  return changedFields(entry).map((field) => ({
    field,
    from: stringify(before[field]),
    to: stringify(after[field]),
  }));
}

export function describeEntry(entry: AuditEntry): string {
  const target = entry.entity_name || entry.entity_id || "registro sem identificação";
  const fields = changedFields(entry);
  const suffix = fields.length > 0 ? ` - campos: ${fields.join(", ")}` : "";
  return `${entityLabel(entry.entity_type)}: ${target}${suffix}`;
}

export interface AuditFilters {
  action: string;
  entityType: string;
  term: string;
}

export const EMPTY_AUDIT_FILTERS: AuditFilters = { action: "all", entityType: "all", term: "" };

export function filterEntries(entries: AuditEntry[], filters: AuditFilters): AuditEntry[] {
  const term = filters.term.trim().toLowerCase();
  return entries.filter((entry) => {
    if (filters.action !== "all" && entry.action !== filters.action) return false;
    if (filters.entityType !== "all" && entry.entity_type !== filters.entityType) return false;
    if (!term) return true;
    const haystack = [
      entry.entity_name,
      entry.entity_id,
      entry.user_email,
      entry.description,
      entry.module,
      entry.entity_type,
      ...changedFields(entry),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(term);
  });
}

export interface TrailSummary {
  total: number;
  creates: number;
  updates: number;
  deletes: number;
  critical: number;
  actors: number;
}

export function summarizeTrail(entries: AuditEntry[]): TrailSummary {
  const actors = new Set<string>();
  let creates = 0;
  let updates = 0;
  let deletes = 0;
  let critical = 0;
  for (const entry of entries) {
    if (entry.action === "create") creates += 1;
    else if (entry.action === "update") updates += 1;
    else if (entry.action === "delete") deletes += 1;
    if (entry.severity === "critical") critical += 1;
    if (entry.user_email) actors.add(entry.user_email);
  }
  return { total: entries.length, creates, updates, deletes, critical, actors: actors.size };
}

export function useAuditTrail() {
  const query = useQuery({
    queryKey: AUDIT_QUERY_KEY,
    queryFn: async (): Promise<AuditEntry[]> => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select(
          "id, user_email, user_role, action, entity_type, entity_id, entity_name, changes, old_values, new_values, description, module, severity, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(AUDIT_TRAIL_LIMIT);
      if (error) throw error;
      return (data ?? []) as AuditEntry[];
    },
    ...queryPresets.list,
  });

  const entries = useMemo(() => query.data ?? [], [query.data]);

  const entityTypes = useMemo(
    () => Array.from(new Set(entries.map((entry) => entry.entity_type))).sort(),
    [entries]
  );

  return {
    entries,
    entityTypes,
    summary: useMemo(() => summarizeTrail(entries), [entries]),
    isLoading: query.isLoading,
    error: query.error
      ? (query.error as { message?: string }).message || "Erro ao carregar a trilha de auditoria"
      : null,
    limit: AUDIT_TRAIL_LIMIT,
  };
}
