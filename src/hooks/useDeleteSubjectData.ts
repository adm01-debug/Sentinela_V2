import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Direito ao esquecimento (LGPD) do titular monitorado.
 *
 * A tela /compliance marcava "Direito ao Esquecimento" como conforme sem que
 * existisse caminho de execucao (`useCompliance.ts` devolvia `true` fixo e a
 * antiga edge so aceitava service_role, credencial que o front nunca tem).
 * Aqui a tela conversa com a edge `delete-user-data`, que valida admin da mesma
 * empresa, exige confirmacao do nome e devolve relatorio por tabela.
 */

export interface SubjectDataCount {
  table: string;
  rows: number | null;
  error?: string;
}

export interface SubjectDataPreview {
  employee_id: string;
  employee_name: string;
  counts: SubjectDataCount[];
  total_rows: number;
}

export interface SubjectDataTableResult {
  table: string;
  ok: boolean;
  error?: string;
}

export interface SubjectDataDeletionResult {
  success: boolean;
  employee_id: string;
  tablesProcessed: number;
  failures: number;
  audit_logged?: boolean;
  results: SubjectDataTableResult[];
}

async function invokeDeleteUserData<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error: fnError } = await supabase.functions.invoke("delete-user-data", { body });
  if (fnError) {
    // A mensagem util vem no corpo da resposta (ex.: "Apenas admin pode excluir
    // dados de titular"); `fnError.message` e sempre a generica do SDK.
    const context = (fnError as { context?: Response }).context;
    const payload = context
      ? await context
          .clone()
          .json()
          .catch(() => null)
      : null;
    const detail = (payload as { error?: string } | null)?.error;
    throw new Error(detail || fnError.message);
  }
  if (data && typeof data === "object" && "error" in data && data.error) {
    throw new Error(String((data as { error: unknown }).error));
  }
  return data as T;
}

/** Contagem por tabela, usada no preview do dialogo (`dry_run`). */
export const useSubjectDataPreview = (employeeId: string | undefined, enabled: boolean) =>
  useQuery({
    queryKey: ["subject-data-preview", employeeId],
    queryFn: () =>
      invokeDeleteUserData<SubjectDataPreview>({ employee_id: employeeId, dry_run: true }),
    enabled: Boolean(employeeId) && enabled,
    retry: false,
    staleTime: 0,
  });

export const useDeleteSubjectData = (employeeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (confirmName: string) =>
      invokeDeleteUserData<SubjectDataDeletionResult>({
        employee_id: employeeId,
        confirm_name: confirmName,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["subject-data-preview", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
    },
  });
};

const TABLE_LABELS: Record<string, string> = {
  keystroke_logs: "Teclas registradas",
  keystroke_details: "Detalhes de teclas",
  click_logs: "Cliques",
  screen_captures: "Capturas de tela",
  session_recordings: "Gravacoes de sessao",
  security_violations: "Violacoes de seguranca",
  mobile_activity_logs: "Atividade mobile",
  internet_access_settings: "Regras de internet",
  geofence_violations: "Violacoes de geofence",
  employee_badges: "Badges",
  employee_points: "Pontos",
  employee_geofences: "Geofences atribuidas",
  employee_schedules: "Escalas atribuidas",
  employee_devices: "Dispositivos",
  employees: "Cadastro do funcionario",
};

export function subjectDataTableLabel(table: string): string {
  return TABLE_LABELS[table] ?? table;
}
