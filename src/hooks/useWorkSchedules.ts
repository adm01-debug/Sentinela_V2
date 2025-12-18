import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WorkSchedule {
  id: string;
  name: string;
  description: string | null;
  work_days: number[];
  start_time: string;
  end_time: string;
  lunch_start: string | null;
  lunch_end: string | null;
  allow_overtime: boolean;
  auto_block_enabled: boolean;
  grace_period_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface EmployeeSchedule {
  id: string;
  employee_id: string;
  schedule_id: string;
  effective_from: string;
  effective_until: string | null;
  created_at: string;
  employee?: {
    id: string;
    name: string;
    department: string | null;
    position: string | null;
  };
  schedule?: WorkSchedule;
}

export interface OvertimeRequest {
  id: string;
  employee_id: string;
  requested_date: string;
  start_time: string;
  end_time: string;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  employee?: {
    id: string;
    name: string;
  };
}

export interface StationBlockLog {
  id: string;
  employee_name: string;
  device: string | null;
  block_type: string;
  reason: string | null;
  blocked_at: string;
  unblocked_at: string | null;
}

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const getDayName = (day: number) => DAY_NAMES[day] || '';
export const getDayShort = (day: number) => DAY_NAMES[day]?.substring(0, 3) || '';

export function useWorkSchedules() {
  const queryClient = useQueryClient();

  // Fetch all work schedules
  const { data: schedules = [], isLoading: loadingSchedules } = useQuery({
    queryKey: ['work-schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_schedules')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as WorkSchedule[];
    }
  });

  // Fetch employee schedules with employee and schedule info
  const { data: employeeSchedules = [], isLoading: loadingEmployeeSchedules } = useQuery({
    queryKey: ['employee-schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_schedules')
        .select(`
          *,
          employee:employees(id, name, department, position),
          schedule:work_schedules(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EmployeeSchedule[];
    }
  });

  // Fetch overtime requests
  const { data: overtimeRequests = [], isLoading: loadingOvertime } = useQuery({
    queryKey: ['overtime-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('overtime_requests')
        .select(`
          *,
          employee:employees(id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as OvertimeRequest[];
    }
  });

  // Fetch station block logs
  const { data: blockLogs = [], isLoading: loadingBlockLogs } = useQuery({
    queryKey: ['station-block-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('station_block_logs')
        .select('*')
        .order('blocked_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as StationBlockLog[];
    }
  });

  // Add work schedule
  const addScheduleMutation = useMutation({
    mutationFn: async (schedule: Omit<WorkSchedule, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('work_schedules')
        .insert(schedule)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-schedules'] });
      toast.success('Jornada criada com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao criar jornada: ' + error.message);
    }
  });

  // Update work schedule
  const updateScheduleMutation = useMutation({
    mutationFn: async ({ id, ...schedule }: Partial<WorkSchedule> & { id: string }) => {
      const { data, error } = await supabase
        .from('work_schedules')
        .update(schedule)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-schedules'] });
      toast.success('Jornada atualizada com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar jornada: ' + error.message);
    }
  });

  // Delete work schedule
  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('work_schedules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-schedules'] });
      toast.success('Jornada excluída com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao excluir jornada: ' + error.message);
    }
  });

  // Assign schedule to employee
  const assignScheduleMutation = useMutation({
    mutationFn: async (data: { employee_id: string; schedule_id: string; effective_from: string; effective_until?: string }) => {
      const { data: result, error } = await supabase
        .from('employee_schedules')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-schedules'] });
      toast.success('Jornada atribuída ao colaborador');
    },
    onError: (error) => {
      toast.error('Erro ao atribuir jornada: ' + error.message);
    }
  });

  // Remove schedule from employee
  const removeEmployeeScheduleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employee_schedules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-schedules'] });
      toast.success('Jornada removida do colaborador');
    },
    onError: (error) => {
      toast.error('Erro ao remover jornada: ' + error.message);
    }
  });

  // Approve/Reject overtime request
  const updateOvertimeRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('overtime_requests')
        .update({
          status,
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['overtime-requests'] });
      toast.success(status === 'approved' ? 'Hora extra aprovada' : 'Hora extra rejeitada');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar solicitação: ' + error.message);
    }
  });

  return {
    schedules,
    employeeSchedules,
    overtimeRequests,
    blockLogs,
    loading: loadingSchedules || loadingEmployeeSchedules || loadingOvertime || loadingBlockLogs,
    addSchedule: addScheduleMutation.mutate,
    updateSchedule: updateScheduleMutation.mutate,
    deleteSchedule: deleteScheduleMutation.mutate,
    assignSchedule: assignScheduleMutation.mutate,
    removeEmployeeSchedule: removeEmployeeScheduleMutation.mutate,
    updateOvertimeRequest: updateOvertimeRequestMutation.mutate,
    getDayName,
    getDayShort
  };
}
