import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface EmployeeScheduleRow {
  id: string;
  employee_id: string;
  schedule_id: string;
  effective_from: string;
  effective_until: string | null;
  employee_name: string | null;
  schedule_name: string | null;
}

export interface AssignEmployeeScheduleInput {
  employee_id: string;
  schedule_id: string;
  effective_from: string;
}

const QUERY_KEY = ["employee-schedules"] as const;

const dia = (valor: string) => valor.slice(0, 10);

/**
 * Atribuicao vigente de um funcionario na data (`YYYY-MM-DD`): a mais recente cujo
 * `effective_from` ja passou e cujo `effective_until` (quando existe) ainda nao venceu.
 */
export function escalaVigenteEm(
  linhas: EmployeeScheduleRow[],
  employeeId: string,
  dataISO: string
): EmployeeScheduleRow | null {
  const alvo = dia(dataISO);

  return linhas
    .filter((linha) => linha.employee_id === employeeId)
    .filter((linha) => dia(linha.effective_from) <= alvo)
    .filter((linha) => !linha.effective_until || dia(linha.effective_until) >= alvo)
    .reduce<EmployeeScheduleRow | null>(
      (vigente, linha) =>
        !vigente || dia(linha.effective_from) > dia(vigente.effective_from) ? linha : vigente,
      null
    );
}

export type SituacaoAtribuicao = "vigente" | "futura" | "encerrada" | "substituida";

/** Por que uma atribuicao aparece (ou nao) como a escala em vigor naquela data. */
export function situacaoDaAtribuicao(
  linha: EmployeeScheduleRow,
  todas: EmployeeScheduleRow[],
  dataISO: string
): SituacaoAtribuicao {
  const alvo = dia(dataISO);

  if (dia(linha.effective_from) > alvo) return "futura";
  if (linha.effective_until && dia(linha.effective_until) < alvo) return "encerrada";

  return escalaVigenteEm(todas, linha.employee_id, alvo)?.id === linha.id
    ? "vigente"
    : "substituida";
}

export function useEmployeeSchedules() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<EmployeeScheduleRow[]> => {
      const { data, error } = await supabase
        .from("employee_schedules")
        .select(
          "id, employee_id, schedule_id, effective_from, effective_until, employees(name), work_schedules(name)"
        )
        .order("effective_from", { ascending: false });
      if (error) throw error;

      return (data ?? []).map((bruto) => {
        const linha = bruto as Record<string, unknown> & {
          employees?: { name?: string | null } | null;
          work_schedules?: { name?: string | null } | null;
        };
        return {
          id: String(linha.id),
          employee_id: String(linha.employee_id),
          schedule_id: String(linha.schedule_id),
          effective_from: String(linha.effective_from),
          effective_until: linha.effective_until ? String(linha.effective_until) : null,
          employee_name: linha.employees?.name ?? null,
          schedule_name: linha.work_schedules?.name ?? null,
        };
      });
    },
  });
}

export function useAssignEmployeeSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: AssignEmployeeScheduleInput) => {
      const { data, error } = await supabase
        .from("employee_schedules")
        .insert({
          employee_id: input.employee_id,
          schedule_id: input.schedule_id,
          effective_from: input.effective_from,
        })
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Escala atribuída" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atribuir", description: error.message, variant: "destructive" });
    },
  });
}

export function useRemoveEmployeeSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employee_schedules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Atribuição removida" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
    },
  });
}
