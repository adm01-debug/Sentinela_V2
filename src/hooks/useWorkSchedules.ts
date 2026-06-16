import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { queryKeys, queryPresets, invalidateRelated } from "@/lib/queryClient";

export interface WorkSchedule {
  id: string;
  employee_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  break_start?: string;
  break_end?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  name?: string;
  description?: string;
  work_days?: number[];
  flexible_start?: boolean;
  flexible_minutes?: number;
  overtime_allowed?: boolean;
  overtime_requires_approval?: boolean;
  block_outside_hours?: boolean;
}

export interface CreateWorkScheduleInput {
  employee_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active?: boolean;
}

export interface UpdateWorkScheduleInput {
  id: string;
  start_time?: string;
  end_time?: string;
  is_active?: boolean;
}

export function useWorkSchedules() {
  return useQuery({
    queryKey: queryKeys.workSchedules.lists(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_schedules")
        .select("*")
        .order("day_of_week", { ascending: true });
      if (error) throw error;
      return data as WorkSchedule[];
    },
    ...queryPresets.list,
  });
}

export function useEmployeeSchedule(employeeId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.workSchedules.employee(employeeId || ""),
    queryFn: async () => {
      if (!employeeId) return [];
      const { data, error } = await supabase
        .from("work_schedules")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("is_active", true);
      if (error) throw error;
      return data as WorkSchedule[];
    },
    enabled: !!employeeId,
    ...queryPresets.detail,
  });
}

export function useCreateWorkSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (input: CreateWorkScheduleInput) => {
      const { data, error } = await supabase.from("work_schedules").insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelated.workSchedules(queryClient);
      toast({ title: "Horário criado" });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateWorkSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateWorkScheduleInput) => {
      const { data, error } = await supabase
        .from("work_schedules")
        .update(input)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelated.workSchedules(queryClient);
      toast({ title: "Horário atualizado" });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteWorkSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("work_schedules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateRelated.workSchedules(queryClient);
      toast({ title: "Horário excluído" });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });
}
