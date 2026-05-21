import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys, queryPresets, CACHE_TIMES } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// ============================================================
// TYPES
// ============================================================

export type ViolationStatus =
  | "open"
  | "acknowledged"
  | "investigating"
  | "resolved"
  | "dismissed"
  | "escalated";

export interface SecurityViolation {
  id: string;
  employee_name: string;
  policy_name: string;
  violation_type: string;
  severity: "low" | "medium" | "high" | "critical";
  status: ViolationStatus;
  description: string | null;
  device: string | null;
  ip_address: string | null;
  read: boolean;
  screenshot_url: string | null;
  location: string | null;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  assigned_to: string | null;
}

export interface ViolationFilters {
  severity?: SecurityViolation["severity"];
  status?: SecurityViolation["status"];
  employeeName?: string;
  startDate?: string;
  endDate?: string;
}

// ============================================================
// FETCH FUNCTIONS
// ============================================================

async function fetchViolations(filters?: ViolationFilters): Promise<SecurityViolation[]> {
  let query = supabase
    .from("security_violations")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.severity) {
    query = query.eq("severity", filters.severity);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.employeeName) {
    query = query.eq("employee_name", filters.employeeName);
  }
  if (filters?.startDate) {
    query = query.gte("created_at", filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte("created_at", filters.endDate);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

async function fetchUnreadCount(): Promise<number> {
  const { count, error } = await supabase
    .from("security_violations")
    .select("*", { count: "exact", head: true })
    .eq("read", false);

  if (error) throw error;
  return count || 0;
}

// ============================================================
// HOOKS - QUERIES
// ============================================================

export function useSecurityViolations(filters?: ViolationFilters) {
  return useQuery({
    queryKey: queryKeys.violations.list(filters as unknown as Record<string, unknown>),
    queryFn: () => fetchViolations(filters),
    ...queryPresets.list,
  });
}

export function useViolation(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.violations.detail(id!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_violations")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: CACHE_TIMES.FREQUENT,
  });
}

export function useUnreadViolationsCount() {
  return useQuery({
    queryKey: queryKeys.violations.unread(),
    queryFn: fetchUnreadCount,
    ...queryPresets.realtime,
  });
}

export function useViolationStats() {
  return useQuery({
    queryKey: ["violations", "stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("security_violations").select("severity, status");

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        bySeverity: {
          critical: data?.filter((v: any) => v.severity === "critical").length || 0,
          high: data?.filter((v: any) => v.severity === "high").length || 0,
          medium: data?.filter((v: any) => v.severity === "medium").length || 0,
          low: data?.filter((v: any) => v.severity === "low").length || 0,
        },
        byStatus: {
          open: data?.filter((v: any) => v.status === "open").length || 0,
          investigating: data?.filter((v: any) => v.status === "investigating").length || 0,
          resolved: data?.filter((v: any) => v.status === "resolved").length || 0,
          dismissed: data?.filter((v: any) => v.status === "dismissed").length || 0,
        },
      };

      return stats;
    },
    staleTime: CACHE_TIMES.FREQUENT,
  });
}

// ============================================================
// HOOKS - MUTATIONS WITH OPTIMISTIC UPDATES
// ============================================================

export function useUpdateViolationStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: SecurityViolation["status"];
      notes?: string;
    }) => {
      const updates: Record<string, string> = { status };

      if (status === "resolved") {
        updates.resolved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("security_violations")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    // Optimistic update
    onMutate: async ({ id, status }) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: queryKeys.violations.all });

      // Snapshot
      const previousViolations = queryClient.getQueryData<SecurityViolation[]>(
        queryKeys.violations.list()
      );

      // Optimistically update
      if (previousViolations) {
        queryClient.setQueryData<SecurityViolation[]>(
          queryKeys.violations.list(),
          previousViolations.map((v: any) =>
            v.id === id
              ? {
                  ...v,
                  status,
                  resolved_at: status === "resolved" ? new Date().toISOString() : v.resolved_at,
                }
              : v
          )
        );
      }

      // Update unread count optimistically
      const previousUnread = queryClient.getQueryData<number>(queryKeys.violations.unread());
      if (previousUnread !== undefined && status !== "open") {
        queryClient.setQueryData(
          queryKeys.violations.unread(),
          Math.max(0, (previousUnread as number) - 1)
        );
      }

      return { previousViolations, previousUnread };
    },

    onError: (err, _, context) => {
      // Rollback
      if (context?.previousViolations) {
        queryClient.setQueryData(queryKeys.violations.list(), context.previousViolations);
      }
      if (context?.previousUnread !== undefined) {
        queryClient.setQueryData(queryKeys.violations.unread(), context.previousUnread);
      }
      toast({
        title: "Erro ao atualizar",
        description: err.message,
        variant: "destructive",
      });
    },

    onSuccess: (data: any) => {
      const statusText: Record<ViolationStatus, string> = {
        open: "aberta",
        acknowledged: "reconhecida",
        investigating: "em investigação",
        resolved: "resolvida",
        dismissed: "descartada",
        escalated: "escalada",
      };
      toast({
        title: "Status atualizado",
        description: `Violação marcada como ${statusText[data.status as ViolationStatus] ?? data.status}.`,
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.violations.all });
    },
  });
}

export function useBulkUpdateViolations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: SecurityViolation["status"] }) => {
      const { data, error } = await supabase
        .from("security_violations")
        .update({ status })
        .in("id", ids)
        .select();

      if (error) throw error;
      return data;
    },

    onMutate: async ({ ids, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.violations.all });

      const previousViolations = queryClient.getQueryData<SecurityViolation[]>(
        queryKeys.violations.list()
      );

      if (previousViolations) {
        queryClient.setQueryData<SecurityViolation[]>(
          queryKeys.violations.list(),
          previousViolations.map((v: any) => (ids.includes(v.id) ? { ...v, status } : v))
        );
      }

      return { previousViolations };
    },

    onError: (err, _, context) => {
      if (context?.previousViolations) {
        queryClient.setQueryData(queryKeys.violations.list(), context.previousViolations);
      }
      toast({
        title: "Erro na operação em lote",
        description: err.message,
        variant: "destructive",
      });
    },

    onSuccess: (data: any) => {
      toast({
        title: "Atualização em lote",
        description: `${data.length} violações foram atualizadas.`,
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.violations.all });
    },
  });
}

// ============================================================
// HOOKS - DELETE
// ============================================================

export function useDeleteViolation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: any) => {
      const { error } = await supabase.from("security_violations").delete().eq("id", id);

      if (error) throw error;
      return id;
    },

    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.violations.all });

      const previousViolations = queryClient.getQueryData<SecurityViolation[]>(
        queryKeys.violations.list()
      );

      if (previousViolations) {
        queryClient.setQueryData<SecurityViolation[]>(
          queryKeys.violations.list(),
          previousViolations.filter((v: any) => v.id !== deletedId)
        );
      }

      return { previousViolations };
    },

    onError: (err, _, context) => {
      if (context?.previousViolations) {
        queryClient.setQueryData(queryKeys.violations.list(), context.previousViolations);
      }
      toast({
        title: "Erro ao excluir",
        description: err.message,
        variant: "destructive",
      });
    },

    onSuccess: () => {
      toast({
        title: "Violação excluída",
        description: "O registro foi removido.",
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.violations.all });
    },
  });
}
