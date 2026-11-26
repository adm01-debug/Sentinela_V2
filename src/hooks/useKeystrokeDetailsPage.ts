import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryPresets } from "@/lib/queryClient";

/**
 * Detalhe de teclas pressionadas.
 *
 * `keystroke_details` guarda cada tecla enviada pelo agente do funcionario
 * (tabela com RLS admin-only, realtime ligado e indices por employee_name /
 * recorded_at). A documentacao declara a funcionalidade pronta, mas nenhuma
 * tela lia a tabela -- so os agregados de useMonitoringPage existiam.
 */
export interface KeystrokeDetail {
  id: string;
  employee_name: string;
  device: string | null;
  app_name: string | null;
  window_title: string | null;
  key_pressed: string;
  key_code: number | null;
  modifiers: string[] | null;
  is_sensitive: boolean | null;
  recorded_at: string;
}

const KEYSTROKES_QUERY_KEY = ["keystroke_details"] as const;
const EMPLOYEES_QUERY_KEY = ["employees", "keystroke-options"] as const;

export const KEYSTROKE_LIMIT = 500;

/** Nomes amigaveis das teclas que o agente manda como texto. */
const KEY_LABEL: Record<string, string> = {
  Enter: "↵",
  Return: "↵",
  Tab: "⇥",
  Backspace: "⌫",
  Delete: "⌦",
  Escape: "Esc",
  Esc: "Esc",
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  " ": "Espaço",
  Space: "Espaço",
  Control: "Ctrl",
  Shift: "Shift",
  Alt: "Alt",
  Meta: "Meta",
};

export const MODIFIER_LABEL: Record<string, string> = {
  ctrl: "Ctrl",
  control: "Ctrl",
  shift: "Shift",
  alt: "Alt",
  meta: "Meta",
  command: "Cmd",
};

export const SENSITIVE_MASK = "•••";

export function labelForKey(key: string): string {
  return KEY_LABEL[key] ?? key;
}

/**
 * Combinacao completa (modificadores + tecla). Tecla de campo sensivel nunca
 * aparece: o proprio agente marca `is_sensitive` para nao vazar senha, entao a
 * tela mostra a mascara e a linha continua visivel como evidencia.
 */
export function formatKeystroke(
  detail: Pick<KeystrokeDetail, "key_pressed" | "modifiers" | "is_sensitive">
): string {
  const parts = (detail.modifiers ?? [])
    .filter((modifier) => modifier.trim().length > 0)
    .map((modifier) => MODIFIER_LABEL[modifier.toLowerCase()] ?? modifier);
  const key = labelForKey(detail.key_pressed);
  const combo = parts.length > 0 ? `${parts.join("+")}+${key}` : key;
  return detail.is_sensitive ? SENSITIVE_MASK : combo;
}

export interface KeystrokeSummary {
  total: number;
  sensitive: number;
  applications: Array<{ name: string; count: number }>;
  devices: number;
}

export function summarizeKeystrokes(entries: KeystrokeDetail[]): KeystrokeSummary {
  const byApp = new Map<string, number>();
  const devices = new Set<string>();
  let sensitive = 0;

  entries.forEach((entry) => {
    const app = entry.app_name?.trim() || "Sem aplicativo";
    byApp.set(app, (byApp.get(app) ?? 0) + 1);
    if (entry.device) devices.add(entry.device);
    if (entry.is_sensitive) sensitive += 1;
  });

  const applications = Array.from(byApp.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return { total: entries.length, sensitive, applications, devices: devices.size };
}

export interface KeystrokeFilters {
  employee?: string;
  application?: string;
  key?: string;
  onlySensitive?: boolean;
}

/**
 * A busca de tecla aceita tanto o nome tecnico ("Enter") quanto o simbolo que a
 * tela mostra ("↵"), porque ninguem procura por uma tecla que nao consegue ler.
 */
export function keyMatches(detail: KeystrokeDetail, term: string): boolean {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;
  return (
    detail.key_pressed.toLowerCase().includes(needle) ||
    labelForKey(detail.key_pressed).toLowerCase().includes(needle)
  );
}

export function filterKeystrokes(
  entries: KeystrokeDetail[],
  filters: KeystrokeFilters
): KeystrokeDetail[] {
  const employee = filters.employee?.trim().toLowerCase() ?? "";
  const application = filters.application?.trim().toLowerCase() ?? "";
  const key = filters.key?.trim().toLowerCase() ?? "";

  return entries.filter((entry) => {
    if (employee && !entry.employee_name.toLowerCase().includes(employee)) return false;
    if (application && !(entry.app_name ?? "").toLowerCase().includes(application)) return false;
    if (key && !keyMatches(entry, key)) return false;
    if (filters.onlySensitive && !entry.is_sensitive) return false;
    return true;
  });
}

/** Inicio do dia em ISO (UTC do navegador), base da janela padrao. */
export function dayStartISO(date: string): string | null {
  const trimmed = date.trim();
  if (!trimmed) return null;
  const parsed = new Date(`${trimmed}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export function dayEndISO(date: string): string | null {
  const trimmed = date.trim();
  if (!trimmed) return null;
  const parsed = new Date(`${trimmed}T23:59:59.999`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export function todayInput(now: Date = new Date()): string {
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function useKeystrokeDetailsPage() {
  const [from, setFrom] = useState(() => todayInput());
  const [to, setTo] = useState(() => todayInput());
  const [employee, setEmployee] = useState("");
  const [application, setApplication] = useState("");
  const [key, setKey] = useState("");
  const [onlySensitive, setOnlySensitive] = useState(false);

  const fromISO = dayStartISO(from);
  const toISO = dayEndISO(to);

  const keystrokesQuery = useQuery({
    queryKey: [...KEYSTROKES_QUERY_KEY, fromISO, toISO],
    queryFn: async (): Promise<KeystrokeDetail[]> => {
      let query = supabase
        .from("keystroke_details")
        .select(
          "id, employee_name, device, app_name, window_title, key_pressed, key_code, modifiers, is_sensitive, recorded_at"
        )
        .order("recorded_at", { ascending: false })
        .limit(KEYSTROKE_LIMIT);

      if (fromISO) query = query.gte("recorded_at", fromISO);
      if (toISO) query = query.lte("recorded_at", toISO);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as KeystrokeDetail[];
    },
    enabled: Boolean(fromISO && toISO),
    ...queryPresets.list,
  });

  const employeesQuery = useQuery({
    queryKey: EMPLOYEES_QUERY_KEY,
    queryFn: async (): Promise<Array<{ id: string; name: string }>> => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, name")
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Array<{ id: string; name: string }>;
    },
    ...queryPresets.config,
  });

  const entries = useMemo(() => keystrokesQuery.data ?? [], [keystrokesQuery.data]);
  const visible = useMemo(
    () => filterKeystrokes(entries, { employee, application, key, onlySensitive }),
    [entries, employee, application, key, onlySensitive]
  );
  const summary = useMemo(() => summarizeKeystrokes(visible), [visible]);

  const applicationOptions = useMemo(
    () =>
      summarizeKeystrokes(entries)
        .applications.map((item) => item.name)
        .slice(0, 40),
    [entries]
  );

  const clearFilters = useCallback(() => {
    setEmployee("");
    setApplication("");
    setKey("");
    setOnlySensitive(false);
  }, []);

  return {
    from,
    setFrom,
    to,
    setTo,
    employee,
    setEmployee,
    application,
    setApplication,
    key,
    setKey,
    onlySensitive,
    setOnlySensitive,
    entries: visible,
    allEntries: entries,
    summary,
    applicationOptions,
    employees: employeesQuery.data ?? [],
    hasFilters: Boolean(employee || application || key || onlySensitive),
    clearFilters,
    isLoading: keystrokesQuery.isLoading,
    isError: keystrokesQuery.isError,
    refetch: keystrokesQuery.refetch,
  };
}
