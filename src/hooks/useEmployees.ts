import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Extended type with device info
export interface EmployeeDevice {
  id: string;
  device_name: string;
  device_type: string;
  is_primary: boolean;
}

export interface EmployeeWithDetails {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  position: string | null;
  team_id: string | null;
  status: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  hire_date?: string | null;
  notes?: string | null;
  devices?: EmployeeDevice[];
}

export interface EmployeeFilters {
  department?: string;
  status?: string;
  search?: string;
}

export interface EmployeeCreateInput {
  name: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  team_id?: string;
  status?: string;
  avatar_url?: string;
  hire_date?: string;
  notes?: string;
  company_id?: string;
}

export interface EmployeeUpdateInput extends Partial<EmployeeCreateInput> {}

export const useEmployees = (filters?: EmployeeFilters) => {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: async () => {
      let query = supabase.from('employees').select('*').order('name');
      if (filters?.department) query = query.eq('department', filters.department);
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.search) query = query.ilike('name', `%${filters.search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('employees').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useEmployeeStats = (id: string, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['employee-stats', id, startDate, endDate],
    queryFn: async () => {
      // Get activity data (keystroke logs as proxy for active days)
      const { data: keystrokeLogs, error: klError } = await supabase
        .from('keystroke_logs')
        .select('recorded_at, keystrokes_count, active_time_seconds, idle_time_seconds')
        .eq('employee_name', id)
        .gte('recorded_at', startDate)
        .lte('recorded_at', endDate);

      // Get violations
      const { count: violationCount, error: vError } = await supabase
        .from('security_violations')
        .select('id', { count: 'exact', head: true })
        .eq('employee_name', id)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      // Get attendance records
      const { data: attendance, error: aError } = await supabase
        .from('attendance_records')
        .select('total_worked_minutes, status')
        .eq('employee_id', id)
        .gte('date', startDate)
        .lte('date', endDate);

      // Calculate productivity from keystroke data
      const logs = keystrokeLogs || [];
      const totalActive = logs.reduce((sum: number, l: Record<string, unknown>) => sum + (l.active_time_seconds || 0), 0);
      const totalIdle = logs.reduce((sum: number, l: Record<string, unknown>) => sum + (l.idle_time_seconds || 0), 0);
      const totalTime = totalActive + totalIdle;
      const productivity = totalTime > 0 ? Math.round((totalActive / totalTime) * 100) : 0;

      // Count unique active days
      const activeDays = new Set(
        logs.map(l: Record<string, unknown> => l.recorded_at?.split('T')[0]).filter(Boolean)
      ).size;

      const violations = violationCount ?? 0;

      // Attendance stats
      const attendanceRecords = attendance || [];
      const totalWorkedMinutes = attendanceRecords.reduce((sum: number, r: Record<string, unknown>) => sum + (r.total_worked_minutes || 0), 0);
      const avgHoursPerDay = attendanceRecords.length > 0 
        ? Math.round((totalWorkedMinutes / attendanceRecords.length / 60) * 10) / 10 
        : 0;

      return {
        productivity,
        activeDays,
        violations,
        totalKeystrokes: logs.reduce((sum: number, l: Record<string, unknown>) => sum + (l.keystrokes_count || 0), 0),
        avgHoursPerDay,
        presentDays: attendanceRecords.filter(r: Record<string, unknown> => r.status === 'present').length,
      };
    },
    enabled: !!id && !!startDate && !!endDate,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: EmployeeCreateInput) => {
      const { data: result, error } = await supabase.from('employees').insert(data).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EmployeeUpdateInput }) => {
      const { data: result, error } = await supabase.from('employees').update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('employees').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); },
  });
};
