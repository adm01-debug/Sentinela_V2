import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '@/services/employeeService';

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

interface KeystrokeStatsRow {
  recorded_at: string | null;
  keystrokes_count: number | null;
  active_time_seconds: number | null;
  idle_time_seconds: number | null;
}

interface AttendanceStatsRow {
  total_worked_minutes: number | null;
  status: string | null;
}

export const useEmployees = (filters?: EmployeeFilters) => {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: () => employeeService.getEmployees(filters),
  });
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeService.getEmployeeById(id),
    enabled: !!id,
  });
};

export const useEmployeeStats = (id: string, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['employee-stats', id, startDate, endDate],
    queryFn: async () => {
      const { keystrokeLogs, violationCount, attendance } = await employeeService.getEmployeeStats(id, startDate, endDate);

      // Calculate productivity from keystroke data
      const logs = (keystrokeLogs || []) as KeystrokeStatsRow[];
      const totalActive = logs.reduce((sum: number, l: KeystrokeStatsRow) => sum + (l.active_time_seconds || 0), 0);
      const totalIdle = logs.reduce((sum: number, l: KeystrokeStatsRow) => sum + (l.idle_time_seconds || 0), 0);
      const totalTime = totalActive + totalIdle;
      const productivity = totalTime > 0 ? Math.round((totalActive / totalTime) * 100) : 0;

      // Count unique active days
      const activeDays = new Set(
        logs.map((l: KeystrokeStatsRow) => l.recorded_at?.split('T')[0]).filter(Boolean)
      ).size;

      const violations = violationCount ?? 0;

      // Attendance stats
      const attendanceRecords = (attendance || []) as AttendanceStatsRow[];
      const totalWorkedMinutes = attendanceRecords.reduce((sum: number, r: AttendanceStatsRow) => sum + (r.total_worked_minutes || 0), 0);
      const avgHoursPerDay = attendanceRecords.length > 0 
        ? Math.round((totalWorkedMinutes / attendanceRecords.length / 60) * 10) / 10 
        : 0;

      return {
        productivity,
        activeDays,
        violations,
        totalKeystrokes: logs.reduce((sum: number, l: KeystrokeStatsRow) => sum + (l.keystrokes_count || 0), 0),
        avgHoursPerDay,
        presentDays: attendanceRecords.filter((r: AttendanceStatsRow) => r.status === 'present').length,
      };
    },
    enabled: !!id && !!startDate && !!endDate,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: EmployeeCreateInput) => employeeService.createEmployee(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EmployeeUpdateInput }) => employeeService.updateEmployee(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeService.deleteEmployee(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); },
  });
};