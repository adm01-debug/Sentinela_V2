import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { queryKeys } from "@/lib/queryClient";

export type PeriodoPontos = "7" | "30" | "all";

export interface FuncionarioOpcao {
  id: string;
  name: string;
  avatar_url: string | null;
}

export interface HistoricoPonto {
  id: string;
  points: number;
  action_type: string;
  description: string | null;
  created_at: string;
}

export interface ConquistaFuncionario {
  id: string;
  earned_at: string;
  badge: { id: string; name: string; icon: string | null } | null;
}

export interface BadgeCatalogo {
  id: string;
  name: string;
  icon: string | null;
  points_required: number | null;
}

/**
 * Detalhe de gamificação por funcionário: histórico de pontos (`points_history`)
 * e conquistas (`employee_badges`), com concessão e remoção de badge.
 * As três tabelas têm RLS de escrita para admin; a tela gateia as ações.
 */
export function useEmployeeGamification() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [employeeId, setEmployeeId] = useState("");
  const [periodo, setPeriodo] = useState<PeriodoPontos>("30");

  const employeesQuery = useQuery({
    queryKey: [...queryKeys.gamification.all, "funcionarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, name, avatar_url")
        .eq("status", "active")
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as FuncionarioOpcao[];
    },
  });

  const desde = useMemo(() => {
    if (periodo === "all") return null;
    const data = new Date();
    data.setDate(data.getDate() - Number(periodo));
    return data.toISOString();
  }, [periodo]);

  const historicoQuery = useQuery({
    queryKey: [...queryKeys.gamification.all, "historico", employeeId, periodo],
    enabled: employeeId !== "",
    queryFn: async () => {
      let query = supabase
        .from("points_history")
        .select("id, points, action_type, description, created_at")
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (desde) query = query.gte("created_at", desde);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as HistoricoPonto[];
    },
  });

  const conquistasQuery = useQuery({
    queryKey: [...queryKeys.gamification.all, "conquistas", employeeId],
    enabled: employeeId !== "",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_badges")
        .select("id, earned_at, badge:badges(id, name, icon)")
        .eq("employee_id", employeeId)
        .order("earned_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ConquistaFuncionario[];
    },
  });

  const catalogoQuery = useQuery({
    queryKey: queryKeys.gamification.badges(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badges")
        .select("id, name, icon, points_required")
        .eq("is_active", true)
        .order("points_required", { ascending: false });
      if (error) throw error;
      return (data ?? []) as BadgeCatalogo[];
    },
  });

  const invalidar = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.gamification.all });
  }, [queryClient]);

  const concederMutation = useMutation({
    mutationFn: async (badgeId: string) => {
      const { error } = await supabase
        .from("employee_badges")
        .insert({ employee_id: employeeId, badge_id: badgeId });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidar();
      toast({ title: "Conquista concedida!" });
    },
    onError: () => {
      toast({ title: "Erro ao conceder conquista", variant: "destructive" });
    },
  });

  const removerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employee_badges").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidar();
      toast({ title: "Conquista removida" });
    },
    onError: () => {
      toast({ title: "Erro ao remover conquista", variant: "destructive" });
    },
  });

  const historico = historicoQuery.data ?? [];
  const conquistas = conquistasQuery.data ?? [];

  const totalPontos = useMemo(
    () => (historicoQuery.data ?? []).reduce((soma, item) => soma + (item.points ?? 0), 0),
    [historicoQuery.data]
  );

  const disponiveis = useMemo(() => {
    const ganhas = new Set((conquistasQuery.data ?? []).map((c) => c.badge?.id).filter(Boolean));
    return (catalogoQuery.data ?? []).filter((badge) => !ganhas.has(badge.id));
  }, [catalogoQuery.data, conquistasQuery.data]);

  return {
    funcionarios: employeesQuery.data ?? [],
    employeeId,
    setEmployeeId,
    periodo,
    setPeriodo,
    historico,
    totalPontos,
    conquistas,
    catalogo: disponiveis,
    isLoading: historicoQuery.isLoading || conquistasQuery.isLoading,
    isLoadingFuncionarios: employeesQuery.isLoading,
    isSaving: concederMutation.isPending || removerMutation.isPending,
    handleConceder: useCallback(
      (badgeId: string) => concederMutation.mutate(badgeId),
      [concederMutation]
    ),
    handleRemover: useCallback((id: string) => removerMutation.mutate(id), [removerMutation]),
  };
}
