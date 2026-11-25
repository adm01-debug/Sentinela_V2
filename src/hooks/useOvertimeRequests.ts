import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface OvertimeRequestRow {
  id: string;
  employee_id: string;
  requested_date: string;
  start_time: string;
  end_time: string;
  reason: string | null;
  status: string;
  employee_name: string | null;
  hours: number;
}

export interface StationBlockRow {
  id: string;
  employee_name: string;
  block_type: string;
  blocked_at: string;
}

const OVERTIME_KEY = ["overtime-requests"] as const;
const BLOCKS_KEY = ["station-block-logs"] as const;

function horasEntre(inicio: string, fim: string): number {
  const [h1, m1] = inicio.split(":").map(Number);
  const [h2, m2] = fim.split(":").map(Number);
  const minutos = h2 * 60 + m2 - (h1 * 60 + m1);
  return minutos > 0 ? Math.round((minutos / 60) * 10) / 10 : 0;
}

export function useOvertimeRequests() {
  return useQuery({
    queryKey: OVERTIME_KEY,
    queryFn: async (): Promise<OvertimeRequestRow[]> => {
      const { data, error } = await supabase
        .from("overtime_requests")
        .select(
          "id, employee_id, requested_date, start_time, end_time, reason, status, employees(name)"
        )
        .order("requested_date", { ascending: false });
      if (error) throw error;

      return (data ?? []).map((bruto) => {
        const linha = bruto as Record<string, unknown> & {
          employees?: { name?: string | null } | null;
        };
        const inicio = String(linha.start_time ?? "");
        const fim = String(linha.end_time ?? "");
        return {
          id: String(linha.id),
          employee_id: String(linha.employee_id),
          requested_date: String(linha.requested_date),
          start_time: inicio,
          end_time: fim,
          reason: linha.reason ? String(linha.reason) : null,
          status: String(linha.status),
          employee_name: linha.employees?.name ?? null,
          hours: horasEntre(inicio, fim),
        };
      });
    },
  });
}

export function useReviewOvertimeRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { error } = await supabase
        .from("overtime_requests")
        .update({ status, approved_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: OVERTIME_KEY });
      toast({ title: "Solicitação atualizada" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    },
  });
}

export function useRecentStationBlocks() {
  return useQuery({
    queryKey: BLOCKS_KEY,
    queryFn: async (): Promise<StationBlockRow[]> => {
      const desde = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("station_block_logs")
        .select("id, employee_name, block_type, blocked_at")
        .gte("blocked_at", desde)
        .order("blocked_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as StationBlockRow[];
    },
  });
}
