import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { queryKeys } from "@/lib/queryClient";

export interface RateLimitLog {
  id: string;
  identifier: string;
  identifier_type: string;
  endpoint: string;
  request_count: number | null;
  window_start: string;
  created_at: string;
}

export interface RateLimitSettings {
  id: string;
  company_id: string | null;
  endpoint: string;
  max_requests: number;
  window_seconds: number;
  block_duration_seconds: number;
  is_active: boolean;
}

export interface RateLimitStats {
  totalRequests: number;
  uniqueIdentifiers: number;
  topEndpoints: [string, number][];
  topIdentifiers: [string, number][];
}

interface LogsPayload {
  logs: RateLimitLog[];
  stats: RateLimitStats;
}

interface FilterState {
  endpoint: string;
  identifierType: string;
  search: string;
  dateRange: { from: Date | null; to: Date | null };
}

const EMPTY_STATS: RateLimitStats = {
  totalRequests: 0,
  uniqueIdentifiers: 0,
  topEndpoints: [],
  topIdentifiers: [],
};

export function useRateLimitDashboardPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<FilterState>({
    endpoint: "all",
    identifierType: "all",
    search: "",
    dateRange: { from: null, to: null },
  });

  // rate_limit_logs e somente service_role por RLS, entao a leitura passa pela
  // edge rate-limit-logs, que exige usuario admin (ou a propria service_role).
  const logsQuery = useQuery({
    queryKey: [...queryKeys.rateLimiting.logs(), filters],
    queryFn: async (): Promise<LogsPayload> => {
      const { data, error } = await supabase.functions.invoke<LogsPayload>("rate-limit-logs", {
        body: {
          endpoint: filters.endpoint,
          identifierType: filters.identifierType,
          search: filters.search,
          from: filters.dateRange.from?.toISOString(),
          to: filters.dateRange.to?.toISOString(),
        },
      });
      if (error) throw error;
      if (!data) throw new Error("Resposta vazia do rate-limit-logs");
      return { logs: data.logs ?? [], stats: data.stats ?? EMPTY_STATS };
    },
  });

  const settingsQuery = useQuery({
    queryKey: queryKeys.rateLimiting.settings(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rate_limit_settings")
        .select("*")
        .order("endpoint");
      if (error) throw error;
      return (data ?? []) as RateLimitSettings[];
    },
  });

  const stats = useMemo(() => logsQuery.data?.stats ?? EMPTY_STATS, [logsQuery.data]);

  const updateSettingsMutation = useMutation({
    mutationFn: async ({ id, ...settings }: Partial<RateLimitSettings> & { id: string }) => {
      const { error } = await supabase.from("rate_limit_settings").update(settings).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rateLimiting.settings() });
      toast({ title: "Limite atualizado" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar limite",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createSettingsMutation = useMutation({
    mutationFn: async (settings: {
      endpoint: string;
      max_requests: number;
      window_seconds: number;
      block_duration_seconds: number;
      is_active: boolean;
    }) => {
      // company_id nulo = limite global, igual ao default da tabela.
      const { error } = await supabase
        .from("rate_limit_settings")
        .insert({ ...settings, company_id: null });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rateLimiting.settings() });
      toast({ title: "Limite criado" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar limite", description: error.message, variant: "destructive" });
    },
  });

  const deleteSettingsMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rate_limit_settings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rateLimiting.settings() });
      toast({ title: "Limite removido" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover limite",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFilterChange = useCallback(
    (key: keyof FilterState, value: FilterState[keyof FilterState]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleUpdateSettings = useCallback(
    (settings: Partial<RateLimitSettings> & { id: string }) => {
      updateSettingsMutation.mutate(settings);
    },
    [updateSettingsMutation]
  );

  const handleCreateSettings = useCallback(
    (settings: {
      endpoint: string;
      max_requests: number;
      window_seconds: number;
      block_duration_seconds: number;
      is_active: boolean;
    }) => {
      createSettingsMutation.mutate(settings);
    },
    [createSettingsMutation]
  );

  const handleDeleteSettings = useCallback(
    (id: string) => {
      deleteSettingsMutation.mutate(id);
    },
    [deleteSettingsMutation]
  );

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.rateLimiting.logs() });
    queryClient.invalidateQueries({ queryKey: queryKeys.rateLimiting.settings() });
  }, [queryClient]);

  return {
    logs: logsQuery.data?.logs ?? [],
    settings: settingsQuery.data ?? [],
    stats,
    filters,

    isLoading: logsQuery.isLoading || settingsQuery.isLoading,
    isError: logsQuery.isError || settingsQuery.isError,
    error: (logsQuery.error as Error | null) ?? (settingsQuery.error as Error | null),
    isRefreshing: logsQuery.isFetching,

    handleFilterChange,
    handleUpdateSettings,
    handleCreateSettings,
    handleDeleteSettings,
    handleRefresh,

    isUpdating: updateSettingsMutation.isPending,
    isCreating: createSettingsMutation.isPending,
    isDeleting: deleteSettingsMutation.isPending,
  };
}
