import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { queryPresets } from "@/lib/queryClient";

/**
 * Isencoes do aceite diario de politicas.
 *
 * A RPC `my_policy_acknowledgment_status` (migration 20261122140000) devolve
 * `is_exempt` procurando `policy_exemptions.employee_name` igual ao e-mail do
 * JWT ou ao nome em user_metadata; o PolicyGate libera o acesso quando o valor
 * vem true. Sem tela ninguem conseguia criar a isencao, entao o campo vivia
 * sempre false e a feature nao existia na pratica.
 */
export interface PolicyExemption {
  id: string;
  employee_name: string;
  reason: string | null;
  exempted_by: string | null;
  created_at: string;
  expires_at: string | null;
}

export interface EmployeeOption {
  id: string;
  name: string;
  email: string | null;
  department: string | null;
}

export interface ExemptionFormData {
  employeeKey: string;
  reason: string;
  expiresAt: string;
}

const EXEMPTIONS_QUERY_KEY = ["policy_exemptions"] as const;
const EMPLOYEES_QUERY_KEY = ["employees", "exemption-options"] as const;

export const EMPTY_EXEMPTION_FORM: ExemptionFormData = {
  employeeKey: "",
  reason: "",
  expiresAt: "",
};

export type ExemptionState = "active" | "expired";

/**
 * Chave gravada em `policy_exemptions.employee_name`. O e-mail vem primeiro
 * porque o JWT sempre o carrega; o nome so funciona quando o
 * user_metadata.name bate exatamente.
 */
export function exemptionKeyFor(employee: { name: string; email?: string | null }): string {
  const email = employee.email?.trim();
  if (email) return email;
  return employee.name.trim();
}

export function isExemptionActive(expiresAt: string | null, now: Date = new Date()): boolean {
  if (!expiresAt) return true;
  const expires = new Date(expiresAt);
  if (Number.isNaN(expires.getTime())) return true;
  return expires.getTime() > now.getTime();
}

export function exemptionState(expiresAt: string | null, now: Date = new Date()): ExemptionState {
  return isExemptionActive(expiresAt, now) ? "active" : "expired";
}

export const EXEMPTION_STATE_LABEL: Record<ExemptionState, string> = {
  active: "Ativa",
  expired: "Expirada",
};

export interface ExemptionSummary {
  total: number;
  active: number;
  expired: number;
  withoutDeadline: number;
}

export function summarizeExemptions(
  exemptions: PolicyExemption[],
  now: Date = new Date()
): ExemptionSummary {
  let active = 0;
  let withoutDeadline = 0;

  exemptions.forEach((item) => {
    if (isExemptionActive(item.expires_at, now)) {
      active += 1;
      if (!item.expires_at) withoutDeadline += 1;
    }
  });

  return {
    total: exemptions.length,
    active,
    expired: exemptions.length - active,
    withoutDeadline,
  };
}

/** Casa a isencao com o cadastro do funcionario (e-mail ou nome). */
export function findEmployeeForKey(
  employees: EmployeeOption[],
  key: string
): EmployeeOption | undefined {
  const target = key.trim().toLowerCase();
  if (!target) return undefined;
  return employees.find(
    (employee) =>
      employee.email?.trim().toLowerCase() === target ||
      employee.name.trim().toLowerCase() === target
  );
}

export function filterExemptions(
  exemptions: PolicyExemption[],
  filters: { search?: string; state?: ExemptionState | "all"; now?: Date }
): PolicyExemption[] {
  const term = filters.search?.trim().toLowerCase() ?? "";
  const now = filters.now ?? new Date();
  return exemptions.filter((item) => {
    if (
      term &&
      !item.employee_name.toLowerCase().includes(term) &&
      !(item.reason ?? "").toLowerCase().includes(term)
    ) {
      return false;
    }
    if (filters.state && filters.state !== "all") {
      return exemptionState(item.expires_at, now) === filters.state;
    }
    return true;
  });
}

/** Converte a data do input (yyyy-mm-dd) no fim do dia em UTC. */
export function expiresAtFromInput(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = new Date(`${trimmed}T23:59:59`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

/** Caminho inverso para o input de edicao. */
export function inputFromExpiresAt(expiresAt: string | null): string {
  if (!expiresAt) return "";
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return "";
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function usePolicyExemptionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState<ExemptionState | "all">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExemption, setEditingExemption] = useState<PolicyExemption | null>(null);
  const [deletingExemption, setDeletingExemption] = useState<PolicyExemption | null>(null);
  const [formData, setFormData] = useState<ExemptionFormData>(EMPTY_EXEMPTION_FORM);

  const exemptionsQuery = useQuery({
    queryKey: EXEMPTIONS_QUERY_KEY,
    queryFn: async (): Promise<PolicyExemption[]> => {
      const { data, error } = await supabase
        .from("policy_exemptions")
        .select("id, employee_name, reason, exempted_by, created_at, expires_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PolicyExemption[];
    },
    ...queryPresets.list,
  });

  const employeesQuery = useQuery({
    queryKey: EMPLOYEES_QUERY_KEY,
    queryFn: async (): Promise<EmployeeOption[]> => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, name, email, department")
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as EmployeeOption[];
    },
    ...queryPresets.config,
  });

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: EXEMPTIONS_QUERY_KEY });
  }, [queryClient]);

  const fail = useCallback(
    (error: { code?: string; message: string }, fallback: string) => {
      toast({
        title: fallback,
        description:
          error.code === "23505"
            ? "Esse funcionario ja tem isencao registrada. Edite a existente."
            : error.message,
        variant: "destructive",
      });
    },
    [toast]
  );

  const createMutation = useMutation({
    mutationFn: async (input: {
      employeeKey: string;
      reason: string;
      expiresAt: string | null;
    }) => {
      const { data } = await supabase.auth.getUser();
      const { error } = await supabase.from("policy_exemptions").insert({
        employee_name: input.employeeKey,
        reason: input.reason.trim() || null,
        expires_at: input.expiresAt,
        exempted_by: data?.user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Isencao registrada" });
      invalidate();
    },
    onError: (error: { code?: string; message: string }) =>
      fail(error, "Erro ao registrar isencao"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      reason,
      expiresAt,
    }: {
      id: string;
      reason: string;
      expiresAt: string | null;
    }) => {
      const { error } = await supabase
        .from("policy_exemptions")
        .update({ reason: reason.trim() || null, expires_at: expiresAt })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Isencao atualizada" });
      invalidate();
    },
    onError: (error: { code?: string; message: string }) =>
      fail(error, "Erro ao atualizar isencao"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("policy_exemptions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Isencao removida" });
      invalidate();
    },
    onError: (error: { code?: string; message: string }) => fail(error, "Erro ao remover isencao"),
  });

  const exemptions = useMemo(() => exemptionsQuery.data ?? [], [exemptionsQuery.data]);
  const employees = useMemo(() => employeesQuery.data ?? [], [employeesQuery.data]);

  const filtered = useMemo(
    () => filterExemptions(exemptions, { search: searchTerm, state: stateFilter }),
    [exemptions, searchTerm, stateFilter]
  );

  const summary = useMemo(() => summarizeExemptions(exemptions), [exemptions]);

  const handleOpenCreate = useCallback(() => {
    setEditingExemption(null);
    setFormData(EMPTY_EXEMPTION_FORM);
    setIsDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((exemption: PolicyExemption) => {
    setEditingExemption(exemption);
    setFormData({
      employeeKey: exemption.employee_name,
      reason: exemption.reason ?? "",
      expiresAt: inputFromExpiresAt(exemption.expires_at),
    });
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingExemption(null);
    setFormData(EMPTY_EXEMPTION_FORM);
  }, []);

  const handleSubmit = useCallback(() => {
    const key = formData.employeeKey.trim();
    if (!key) {
      toast({ title: "Selecione o funcionario", variant: "destructive" });
      return;
    }
    const expiresAt = expiresAtFromInput(formData.expiresAt);
    if (editingExemption) {
      updateMutation.mutate({ id: editingExemption.id, reason: formData.reason, expiresAt });
    } else {
      createMutation.mutate({ employeeKey: key, reason: formData.reason, expiresAt });
    }
    handleCloseDialog();
  }, [createMutation, editingExemption, formData, handleCloseDialog, toast, updateMutation]);

  const handleDelete = useCallback(() => {
    if (deletingExemption) deleteMutation.mutate(deletingExemption.id);
    setDeletingExemption(null);
  }, [deleteMutation, deletingExemption]);

  const handleExtend = useCallback(
    (exemption: PolicyExemption, days: number) => {
      const base = exemption.expires_at ? new Date(exemption.expires_at) : new Date();
      if (Number.isNaN(base.getTime())) base.setTime(Date.now());
      base.setDate(base.getDate() + days);
      updateMutation.mutate({
        id: exemption.id,
        reason: exemption.reason ?? "",
        expiresAt: base.toISOString(),
      });
    },
    [updateMutation]
  );

  return {
    searchTerm,
    setSearchTerm,
    stateFilter,
    setStateFilter,
    isDialogOpen,
    setIsDialogOpen,
    editingExemption,
    deletingExemption,
    setDeletingExemption,
    formData,
    setFormData,
    exemptions: filtered,
    allExemptions: exemptions,
    employees,
    summary,
    isLoading: exemptionsQuery.isLoading,
    isError: exemptionsQuery.isError,
    refetch: exemptionsQuery.refetch,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseDialog,
    handleSubmit,
    handleDelete,
    handleExtend,
  };
}
