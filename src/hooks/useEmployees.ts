import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { queryKeys, queryPresets, invalidateRelated } from '@/lib/queryClient';

// ============================================================
// TYPES
// ============================================================

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  team_id?: string;
  status: 'active' | 'inactive' | 'suspended';
  hire_date?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateEmployeeInput {
  name: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  team_id?: string;
  status?: Employee['status'];
  hire_date?: string;
}

export interface UpdateEmployeeInput extends Partial<CreateEmployeeInput> {
  id: string;
}

export interface EmployeeFilters {
  status?: Employee['status'];
  department?: string;
  team_id?: string;
  search?: string;
}

// ============================================================
// HOOKS
// ============================================================

/**
 * Lista todos os funcionários com filtros opcionais
 */
export function useEmployees(filters?: EmployeeFilters) {
  return useQuery({
    queryKey: queryKeys.employees.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('employees')
        .select('*')
        .order('name');

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.department) {
        query = query.eq('department', filters.department);
      }
      if (filters?.team_id) {
        query = query.eq('team_id', filters.team_id);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Employee[];
    },
    ...queryPresets.list,
  });
}

/**
 * Busca um funcionário específico por ID
 */
export function useEmployee(id: string) {
  return useQuery({
    queryKey: queryKeys.employees.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*, teams(name)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Employee & { teams?: { name: string } };
    },
    enabled: !!id,
    ...queryPresets.list,
  });
}

/**
 * Estatísticas do funcionário
 */
export function useEmployeeStats(employeeId: string) {
  return useQuery({
    queryKey: queryKeys.employees.stats(employeeId),
    queryFn: async () => {
      // Buscar violações do funcionário
      const { data: violations, error: violationsError } = await supabase
        .from('security_violations')
        .select('id, severity')
        .eq('employee_id', employeeId);

      if (violationsError) throw violationsError;

      // Buscar atividade recente
      const { data: activity, error: activityError } = await supabase
        .from('employee_activity')
        .select('productivity_score')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (activityError) throw activityError;

      const avgProductivity = activity?.length
        ? activity.reduce((acc, a) => acc + (a.productivity_score || 0), 0) / activity.length
        : 0;

      return {
        totalViolations: violations?.length || 0,
        criticalViolations: violations?.filter(v => v.severity === 'critical').length || 0,
        avgProductivity: Math.round(avgProductivity),
        activityDays: activity?.length || 0,
      };
    },
    enabled: !!employeeId,
    ...queryPresets.list,
  });
}

/**
 * Criar novo funcionário
 */
export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateEmployeeInput) => {
      const { data, error } = await supabase
        .from('employees')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data as Employee;
    },
    onSuccess: () => {
      invalidateRelated.employee(queryClient);
      toast.success('Funcionário criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar funcionário: ${error.message}`);
    },
  });
}

/**
 * Atualizar funcionário
 */
export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateEmployeeInput) => {
      const { data, error } = await supabase
        .from('employees')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Employee;
    },
    onSuccess: (data) => {
      invalidateRelated.employee(queryClient, data.id);
      toast.success('Funcionário atualizado!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });
}

/**
 * Deletar funcionário
 */
export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      invalidateRelated.employee(queryClient);
      toast.success('Funcionário removido!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover: ${error.message}`);
    },
  });
}

/**
 * Alterar status do funcionário
 */
export function useUpdateEmployeeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Employee['status'] }) => {
      const { data, error } = await supabase
        .from('employees')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Employee;
    },
    onSuccess: (data) => {
      invalidateRelated.employee(queryClient, data.id);
      toast.success(`Status alterado para ${data.status}!`);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao alterar status: ${error.message}`);
    },
  });
}
