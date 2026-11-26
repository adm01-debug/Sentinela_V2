import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryPresets } from "@/lib/queryClient";

const LOG_QUERY_KEY = ["dlp_redaction_log"] as const;
const COMPANIES_QUERY_KEY = ["companies", "options"] as const;

export interface RedactionLogEntry {
  id: string;
  company_id: string | null;
  incident_id: string | null;
  classifier_code: string;
  action: string;
  bbox_count: number | null;
  occurred_at: string;
}

export const REDACTION_ACTION_LABEL: Record<string, string> = {
  alert: "Alerta",
  redact: "Redigido",
  block: "Bloqueado",
};

export const REDACTION_PERIODS = [
  { value: 7, label: "Últimos 7 dias" },
  { value: 30, label: "Últimos 30 dias" },
  { value: 90, label: "Últimos 90 dias" },
];

export const REDACTION_ALL = "__all__";

export function labelForRedactionAction(action: string): string {
  return REDACTION_ACTION_LABEL[action] ?? action;
}

/** Inicio do periodo consultado (UTC ISO), em dias para tras. */
export function sinceISO(days: number, now: Date = new Date()): string {
  const since = new Date(now.getTime());
  since.setUTCDate(since.getUTCDate() - days);
  return since.toISOString();
}

export interface RedactionSummary {
  total: number;
  redacted: number;
  blocked: number;
  alerted: number;
  classifiers: Array<{ code: string; count: number }>;
  bboxTotal: number;
}

/**
 * Resumo do log de redacoes: a tabela e append-only e escrita pela edge
 * dlp-incident-report (uma linha por incidente inserido).
 */
export function summarizeRedactions(entries: RedactionLogEntry[]): RedactionSummary {
  const byClassifier = new Map<string, number>();
  let redacted = 0;
  let blocked = 0;
  let alerted = 0;
  let bboxTotal = 0;

  entries.forEach((entry) => {
    byClassifier.set(entry.classifier_code, (byClassifier.get(entry.classifier_code) ?? 0) + 1);
    if (entry.action === "redact") redacted += 1;
    if (entry.action === "block") blocked += 1;
    if (entry.action === "alert") alerted += 1;
    bboxTotal += entry.bbox_count ?? 0;
  });

  const classifiers = Array.from(byClassifier.entries())
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);

  return { total: entries.length, redacted, blocked, alerted, classifiers, bboxTotal };
}

export function filterRedactions(
  entries: RedactionLogEntry[],
  filters: { action?: string; classifier?: string }
): RedactionLogEntry[] {
  return entries.filter((entry) => {
    if (filters.action && filters.action !== REDACTION_ALL && entry.action !== filters.action) {
      return false;
    }
    if (
      filters.classifier &&
      filters.classifier !== REDACTION_ALL &&
      entry.classifier_code !== filters.classifier
    ) {
      return false;
    }
    return true;
  });
}

export function useDLPRedactionLogPage() {
  const [days, setDays] = useState(30);
  const [action, setAction] = useState(REDACTION_ALL);
  const [classifier, setClassifier] = useState(REDACTION_ALL);

  const logQuery = useQuery({
    queryKey: [...LOG_QUERY_KEY, days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dlp_redaction_log")
        .select("id, company_id, incident_id, classifier_code, action, bbox_count, occurred_at")
        .gte("occurred_at", sinceISO(days))
        .order("occurred_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      return (data ?? []) as RedactionLogEntry[];
    },
    ...queryPresets.list,
  });

  const companiesQuery = useQuery({
    queryKey: COMPANIES_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase.from("companies").select("id, name");
      if (error) throw error;
      return (data ?? []) as Array<{ id: string; name: string | null }>;
    },
    ...queryPresets.config,
  });

  const entries = useMemo(() => logQuery.data ?? [], [logQuery.data]);
  const filtered = useMemo(
    () => filterRedactions(entries, { action, classifier }),
    [entries, action, classifier]
  );
  const summary = useMemo(() => summarizeRedactions(filtered), [filtered]);

  const classifierOptions = useMemo(
    () =>
      summarizeRedactions(entries)
        .classifiers.map((item) => item.code)
        .sort((a, b) => a.localeCompare(b)),
    [entries]
  );

  const companyNames = useMemo(() => {
    const names = new Map<string, string>();
    (companiesQuery.data ?? []).forEach((company) => {
      names.set(company.id, company.name ?? "");
    });
    return names;
  }, [companiesQuery.data]);

  return {
    days,
    setDays,
    action,
    setAction,
    classifier,
    setClassifier,
    entries: filtered,
    allEntries: entries,
    summary,
    classifierOptions,
    companyNames,
    actionOptions: Object.keys(REDACTION_ACTION_LABEL),
    isLoading: logQuery.isLoading,
    isError: logQuery.isError,
    refetch: logQuery.refetch,
  };
}
