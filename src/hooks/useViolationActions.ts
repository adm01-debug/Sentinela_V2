import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { queryKeys, queryPresets } from "@/lib/queryClient";

export type ViolationActionType =
  "acknowledge" | "investigate" | "warn" | "escalate" | "resolve" | "dismiss" | "reopen";

export interface ViolationAction {
  id: string;
  violation_id: string;
  user_id: string;
  action_type: ViolationActionType | string;
  notes: string | null;
  previous_status: string | null;
  new_status: string | null;
  created_at: string;
  author_name?: string | null;
}

export interface RecordViolationActionInput {
  violationId: string;
  actionType: ViolationActionType | string;
  notes?: string | null;
  previousStatus?: string | null;
  newStatus?: string | null;
}

export const VIOLATION_ACTION_META: Record<
  ViolationActionType,
  { label: string; description: string }
> = {
  acknowledge: {
    label: "Reconhecida",
    description: "Um responsável assumiu a violação para tratamento",
  },
  investigate: {
    label: "Em investigação",
    description: "Apuração dos fatos iniciada",
  },
  warn: {
    label: "Advertência aplicada",
    description: "Orientação registrada sem alterar o status da violação",
  },
  escalate: {
    label: "Escalada",
    description: "Enviada para instância superior",
  },
  resolve: {
    label: "Resolvida",
    description: "Tratamento concluído",
  },
  dismiss: {
    label: "Descartada",
    description: "Sem procedência após análise",
  },
  reopen: {
    label: "Reaberta",
    description: "Voltou para a fila de tratamento",
  },
};

// Ação que o gestor executa na tela e o status que ela produz.
export const ACTION_STATUS: Record<ViolationActionType, string | null> = {
  acknowledge: "acknowledged",
  investigate: "investigating",
  warn: null,
  escalate: "escalated",
  resolve: "resolved",
  dismiss: "dismissed",
  reopen: "open",
};

// Status produzido -> ação registrada no histórico.
export const STATUS_ACTION: Record<string, ViolationActionType> = {
  open: "reopen",
  acknowledged: "acknowledge",
  investigating: "investigate",
  escalated: "escalate",
  resolved: "resolve",
  dismissed: "dismiss",
};

export function actionForStatus(status: string | null | undefined): ViolationActionType | null {
  if (!status) return null;
  return STATUS_ACTION[status] ?? null;
}

export function labelForAction(actionType: string): string {
  return VIOLATION_ACTION_META[actionType as ViolationActionType]?.label ?? actionType;
}

export function describeTransition(
  previousStatus: string | null | undefined,
  newStatus: string | null | undefined
): string | null {
  if (!newStatus) return null;
  if (!previousStatus || previousStatus === newStatus) return labelForAction(newStatus);
  return `${labelForAction(previousStatus)} -> ${labelForAction(newStatus)}`;
}

/**
 * Grava uma acao no historico da violacao (violation_actions).
 * Usado pela mudanca de status (auditoria automatica) e pelo registro manual.
 */
export async function recordViolationAction(input: RecordViolationActionInput): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const notes = input.notes?.trim();

  const { error } = await supabase.from("violation_actions").insert({
    violation_id: input.violationId,
    user_id: user.id,
    action_type: input.actionType,
    notes: notes ? notes : null,
    previous_status: input.previousStatus ?? null,
    new_status: input.newStatus ?? null,
  });

  if (error) throw error;
}

async function resolveAuthorNames(actions: ViolationAction[]): Promise<ViolationAction[]> {
  const ids = Array.from(new Set(actions.map((action) => action.user_id).filter(Boolean)));
  if (ids.length === 0) return actions;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", ids);

  if (error) return actions;

  const names = new Map<string, string>();
  (data ?? []).forEach(
    (profile: { id: string; full_name?: string | null; email?: string | null }) => {
      names.set(profile.id, profile.full_name || profile.email || "");
    }
  );

  return actions.map((action) => ({
    ...action,
    author_name: names.get(action.user_id) || null,
  }));
}

export function useViolationActions(violationId?: string) {
  return useQuery({
    queryKey: queryKeys.violations.actions(violationId ?? ""),
    queryFn: async () => {
      if (!violationId) return [] as ViolationAction[];

      const { data, error } = await supabase
        .from("violation_actions")
        .select("*")
        .eq("violation_id", violationId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return resolveAuthorNames((data ?? []) as ViolationAction[]);
    },
    enabled: !!violationId,
    ...queryPresets.list,
  });
}

export function useRecordViolationAction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: RecordViolationActionInput) => {
      await recordViolationAction(input);
      return input;
    },
    onSuccess: (input) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.violations.actions(input.violationId),
      });
      toast({
        title: "Ação registrada",
        description: `${labelForAction(input.actionType)} no histórico da violação.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao registrar ação",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
