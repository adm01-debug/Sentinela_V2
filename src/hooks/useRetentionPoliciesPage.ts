import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Retencao de dados por empresa (LGPD).
 *
 * Quem le a tabela em producao:
 *  - `upload-recording-chunk` (resolveRetentionDays) usa `data_type = 'recordings'`
 *    e grava `recording_sessions.expires_at`; sem politica, cai para 30 dias.
 *  - `expire-recordings` usa `data_type = 'file_transfers'` para apagar eventos
 *    vencidos; sem politica, cai para 90 dias (DEFAULT_FILE_TRANSFER_DAYS).
 *
 * Os outros quatro tipos ainda nao tem job de expurgo: a politica fica guardada
 * e a tela marca explicitamente "ainda nao aplicada" em vez de prometer efeito.
 *
 * Regra de precedencia (identica a das edges): politica ativa da empresa vence a
 * global (`company_id IS NULL`), que vence o padrao embutido no codigo.
 */
export const RETENTION_DATA_TYPES = [
  "recordings",
  "screenshots",
  "keystrokes",
  "activity_logs",
  "violations",
  "file_transfers",
] as const;

export type RetentionDataType = (typeof RETENTION_DATA_TYPES)[number];

export interface RetentionPolicy {
  id: string;
  company_id: string | null;
  data_type: RetentionDataType;
  retention_days: number;
  is_active: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

interface DataTypeMeta {
  label: string;
  description: string;
  /** Dias aplicados quando nao existe politica nenhuma; `null` = sem job de expurgo. */
  fallbackDays: number | null;
  /** Origem do expurgo, para a tela dizer quem aplica de fato. */
  appliedBy: string | null;
}

export const RETENTION_DATA_TYPE_META: Record<RetentionDataType, DataTypeMeta> = {
  recordings: {
    label: "Gravacoes de sessao",
    description: "Videos das sessoes de tela; o binario e apagado e os metadados ficam.",
    fallbackDays: 30,
    appliedBy: "upload-recording-chunk + expire-recordings",
  },
  screenshots: {
    label: "Screenshots",
    description: "Capturas periodicas de tela enviadas pelo agente.",
    fallbackDays: null,
    appliedBy: null,
  },
  keystrokes: {
    label: "Registro de teclas",
    description: "Contagem e detalhamento de teclas por janela.",
    fallbackDays: null,
    appliedBy: null,
  },
  activity_logs: {
    label: "Logs de atividade",
    description: "Aplicativos, janelas e cliques coletados pelos agentes.",
    fallbackDays: null,
    appliedBy: null,
  },
  violations: {
    label: "Violacoes",
    description: "Ocorrencias de politica registradas pelo monitoramento.",
    fallbackDays: null,
    appliedBy: null,
  },
  file_transfers: {
    label: "Transferencias de arquivo",
    description: "Eventos de envio/recebimento de arquivo entre dispositivos.",
    fallbackDays: 90,
    appliedBy: "expire-recordings",
  },
};

export type RetentionSource = "empresa" | "global" | "padrao" | "sem-padrao";

export interface EffectiveRetention {
  days: number | null;
  source: RetentionSource;
  /** Id da politica que esta valendo, quando existe. */
  policyId: string | null;
}

const POLICIES_QUERY_KEY = ["data-retention-policies"] as const;
const COMPANIES_QUERY_KEY = ["companies-for-retention"] as const;

/**
 * Espelha a leitura das edges: so politica ativa conta, empresa vence global.
 * Uma linha inativa cai para o proximo nivel em vez de zerar a retencao.
 */
export function resolveEffectiveRetention(
  policies: RetentionPolicy[],
  companyId: string | null,
  dataType: RetentionDataType
): EffectiveRetention {
  const active = policies.filter((p) => p.data_type === dataType && p.is_active);

  if (companyId) {
    const scoped = active.find((p) => p.company_id === companyId);
    if (scoped) return { days: scoped.retention_days, source: "empresa", policyId: scoped.id };
  }

  const global = active.find((p) => p.company_id === null);
  if (global) return { days: global.retention_days, source: "global", policyId: global.id };

  const fallback = RETENTION_DATA_TYPE_META[dataType].fallbackDays;
  if (fallback === null) return { days: null, source: "sem-padrao", policyId: null };
  return { days: fallback, source: "padrao", policyId: null };
}

/** Politica ja cadastrada para o escopo pedido (a tela edita em vez de duplicar). */
export function findPolicy(
  policies: RetentionPolicy[],
  companyId: string | null,
  dataType: RetentionDataType
): RetentionPolicy | undefined {
  return policies.find(
    (p) => p.data_type === dataType && (p.company_id ?? null) === (companyId ?? null)
  );
}

export interface CompanyOption {
  id: string;
  name: string;
}

export interface RetentionFormInput {
  companyId: string | null;
  dataType: RetentionDataType;
  retentionDays: number;
  isActive: boolean;
}

export function useRetentionPoliciesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("__global__");

  const {
    data: policies = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: POLICIES_QUERY_KEY,
    queryFn: async (): Promise<RetentionPolicy[]> => {
      const { data, error } = await supabase
        .from("data_retention_policies")
        .select("*")
        .order("data_type", { ascending: true });
      if (error) throw error;
      return (data ?? []) as RetentionPolicy[];
    },
  });

  const { data: companies = [] } = useQuery({
    queryKey: COMPANIES_QUERY_KEY,
    queryFn: async (): Promise<CompanyOption[]> => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return (data ?? []) as CompanyOption[];
    },
  });

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: POLICIES_QUERY_KEY });
  }, [queryClient]);

  const fail = useCallback(
    (error: { code?: string; message: string }, fallback: string) => {
      toast({
        title: fallback,
        description: error.message,
        variant: "destructive",
      });
    },
    [toast]
  );

  const { mutateAsync: savePolicy, isPending: isSaving } = useMutation({
    mutationFn: async (input: RetentionFormInput) => {
      const scope = input.companyId ?? null;
      const existing = findPolicy(policies, scope, input.dataType);
      const payload = {
        company_id: scope,
        data_type: input.dataType,
        retention_days: input.retentionDays,
        is_active: input.isActive,
        updated_at: new Date().toISOString(),
      };

      // `UNIQUE (company_id, data_type)` nao deduplica escopo global, porque no
      // Postgres dois NULL nao colidem: sem esta checagem cada gravacao global
      // criaria uma linha nova e a edge usaria a primeira encontrada.
      const { error } = existing
        ? await supabase.from("data_retention_policies").update(payload).eq("id", existing.id)
        : await supabase.from("data_retention_policies").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Politica de retencao salva" });
      invalidate();
    },
    onError: (error: { code?: string; message: string }) => fail(error, "Erro ao salvar politica"),
  });

  const { mutateAsync: deletePolicy, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("data_retention_policies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Politica removida" });
      invalidate();
    },
    onError: (error: { code?: string; message: string }) => fail(error, "Erro ao remover politica"),
  });

  const { mutateAsync: toggleActive } = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("data_retention_policies")
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(),
    onError: (error: { code?: string; message: string }) => fail(error, "Erro ao alterar politica"),
  });

  const scopeCompanyId = selectedCompanyId === "__global__" ? null : selectedCompanyId;

  const effective = RETENTION_DATA_TYPES.map((dataType) => ({
    dataType,
    ...resolveEffectiveRetention(policies, scopeCompanyId, dataType),
  }));

  const companyOptions = [{ id: "__global__", name: "Global (todas as empresas)" }, ...companies];

  return {
    policies,
    companies,
    companyOptions,
    selectedCompanyId,
    setSelectedCompanyId,
    scopeCompanyId,
    effective,
    isLoading,
    isError,
    refetch,
    isSaving,
    isDeleting,
    savePolicy,
    deletePolicy,
    toggleActive,
    findPolicy: (dataType: RetentionDataType) => findPolicy(policies, scopeCompanyId, dataType),
  };
}
