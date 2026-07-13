import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '@/services/employeeService';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, queryPresets, invalidateRelated } from '@/lib/queryClient';
import { useRealtime } from '@/hooks/useRealtime';

type QueryPreset = { staleTime?: number; gcTime?: number; refetchOnWindowFocus?: boolean };
type QueryPresetsShape = { list?: QueryPreset; detail?: QueryPreset; dashboard?: QueryPreset };
const presets: QueryPresetsShape = queryPresets as QueryPresetsShape;


// ============================================================
// TYPES
// ============================================================

export interface EmployeeDevice {
  id: string;
  device_name: string;
  device_type: string;
  is_primary: boolean;
}

export interface EmployeeWithDetails {
  id: string;
  name: string;
  full_name?: string | null;
  role?: string | null;
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
  full_name?: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  role?: string;
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

// ============================================================
// QUERIES
// ============================================================

export const useEmployees = (filters?: EmployeeFilters) => {
  const queryKey = queryKeys.employees.list(filters);
  useRealtime('employees', queryKey as unknown as readonly unknown[]);
  
  return useQuery({
    queryKey,
    queryFn: () => employeeService.getEmployees(filters),
    ...(presets.list ?? {}),
  });
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: queryKeys.employees.detail(id),
    queryFn: () => employeeService.getEmployeeById(id),
    enabled: !!id,
    ...(presets.detail ?? {}),
  });
};

export const useEmployeeStats = (id: string, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: queryKeys.employees.stats(id),
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
    ...(presets.dashboard ?? {}),
  });
};

// ============================================================
// MUTATIONS
// ============================================================

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: EmployeeCreateInput) => employeeService.createEmployee(data),
    onSuccess: () => {
      invalidateRelated.employees(queryClient);
      toast({
        title: 'Funcionário criado',
        description: 'O funcionário foi cadastrado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar funcionário',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EmployeeUpdateInput }) => employeeService.updateEmployee(id, data),
    onSuccess: (_, { id }) => {
      invalidateRelated.employee(queryClient, id);
      toast({
        title: 'Funcionário atualizado',
        description: 'Os dados do funcionário foram salvos com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar funcionário',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => employeeService.deleteEmployee(id),
    onSuccess: () => {
      invalidateRelated.employees(queryClient);
      toast({
        title: 'Funcionário excluído',
        description: 'O registro foi removido com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir funcionário',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useAssignDevice = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ employeeId, name, type, primary }: { employeeId: string, name: string, type: string, primary: boolean }) => 
      employeeService.assignDevice(employeeId, name, type, primary),
    onSuccess: (_, { employeeId }) => {
      invalidateRelated.employee(queryClient, employeeId);
      toast({
        title: 'Dispositivo vinculado',
        description: 'O dispositivo foi associado ao funcionário.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao vincular dispositivo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUnassignDevice = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ employeeId, deviceId }: { employeeId: string, deviceId: string }) => 
      employeeService.unassignDevice(deviceId),
    onSuccess: (_, { employeeId }) => {
      invalidateRelated.employee(queryClient, employeeId);
      toast({
        title: 'Dispositivo removido',
        description: 'O vínculo do dispositivo foi removido.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao remover dispositivo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export default useEmployees;
