import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, queryPresets, invalidateRelated } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// ============================================================
// TYPES
// ============================================================

export interface Employee {
  id: string;
  name: string;
  email: string;
  department?: string;
  position?: string;
  status: 'active' | 'inactive' | 'suspended';
  avatar_url?: string;
  phone?: string;
  team_id?: string;
  company_id?: string;
  last_activity_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeInput {
  name: string;
  email: string;
  department?: string;
  position?: string;
  phone?: string;
  team_id?: string;
}

export interface UpdateEmployeeInput extends Partial<CreateEmployeeInput> {
  id: string;
  status?: Employee['status'];
}

// ============================================================
// FETCH FUNCTIONS
// ============================================================

async function fetchEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

async function fetchEmployee(id: string): Promise<Employee | null> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// ============================================================
// HOOKS - QUERIES
// ============================================================

export function useEmployees() {
  return useQuery({
    queryKey: queryKeys.employees.lists(),
    queryFn: fetchEmployees,
    ...queryPresets.list,
  });
}

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.employees.detail(id!),
    queryFn: () => fetchEmployee(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================
// HOOKS - MUTATIONS WITH OPTIMISTIC UPDATES
// ============================================================

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateEmployeeInput) => {
      const { data, error } = await supabase
        .from('employees')
        .insert({ ...input, status: 'active' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    // Optimistic update
    onMutate: async (newEmployee) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.employees.lists() });

      // Snapshot previous value
      const previousEmployees = queryClient.getQueryData<Employee[]>(
        queryKeys.employees.lists()
      );

      // Optimistically update
      if (previousEmployees) {
        const optimisticEmployee: Employee = {
          id: `temp-${Date.now()}`,
          ...newEmployee,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        queryClient.setQueryData<Employee[]>(
          queryKeys.employees.lists(),
          [...previousEmployees, optimisticEmployee]
        );
      }

      return { previousEmployees };
    },

    // On error, rollback
    onError: (err, _, context) => {
      if (context?.previousEmployees) {
        queryClient.setQueryData(
          queryKeys.employees.lists(),
          context.previousEmployees
        );
      }
      toast({
        title: 'Erro ao criar funcionário',
        description: err.message,
        variant: 'destructive',
      });
    },

    // On success, replace optimistic data with real data
    onSuccess: (data) => {
      invalidateRelated.employee(queryClient, data.id);
      toast({
        title: 'Funcionário criado',
        description: `${data.name} foi adicionado com sucesso.`,
      });
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateEmployeeInput) => {
      const { data, error } = await supabase
        .from('employees')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    // Optimistic update
    onMutate: async (updatedEmployee) => {
      const { id, ...updates } = updatedEmployee;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.employees.lists() });
      await queryClient.cancelQueries({ queryKey: queryKeys.employees.detail(id) });

      // Snapshot previous values
      const previousEmployees = queryClient.getQueryData<Employee[]>(
        queryKeys.employees.lists()
      );
      const previousEmployee = queryClient.getQueryData<Employee>(
        queryKeys.employees.detail(id)
      );

      // Optimistically update list
      if (previousEmployees) {
        queryClient.setQueryData<Employee[]>(
          queryKeys.employees.lists(),
          previousEmployees.map((emp) =>
            emp.id === id ? { ...emp, ...updates, updated_at: new Date().toISOString() } : emp
          )
        );
      }

      // Optimistically update detail
      if (previousEmployee) {
        queryClient.setQueryData<Employee>(
          queryKeys.employees.detail(id),
          { ...previousEmployee, ...updates, updated_at: new Date().toISOString() }
        );
      }

      return { previousEmployees, previousEmployee };
    },

    // On error, rollback
    onError: (err, variables, context) => {
      if (context?.previousEmployees) {
        queryClient.setQueryData(
          queryKeys.employees.lists(),
          context.previousEmployees
        );
      }
      if (context?.previousEmployee) {
        queryClient.setQueryData(
          queryKeys.employees.detail(variables.id),
          context.previousEmployee
        );
      }
      toast({
        title: 'Erro ao atualizar',
        description: err.message,
        variant: 'destructive',
      });
    },

    onSuccess: (data) => {
      invalidateRelated.employee(queryClient, data.id);
      toast({
        title: 'Funcionário atualizado',
        description: 'As informações foram salvas.',
      });
    },

    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(variables.id) });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },

    // Optimistic update
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.employees.lists() });

      const previousEmployees = queryClient.getQueryData<Employee[]>(
        queryKeys.employees.lists()
      );

      // Optimistically remove from list
      if (previousEmployees) {
        queryClient.setQueryData<Employee[]>(
          queryKeys.employees.lists(),
          previousEmployees.filter((emp) => emp.id !== deletedId)
        );
      }

      return { previousEmployees };
    },

    // On error, rollback
    onError: (err, _, context) => {
      if (context?.previousEmployees) {
        queryClient.setQueryData(
          queryKeys.employees.lists(),
          context.previousEmployees
        );
      }
      toast({
        title: 'Erro ao excluir',
        description: err.message,
        variant: 'destructive',
      });
    },

    onSuccess: (deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.employees.detail(deletedId) });
      toast({
        title: 'Funcionário excluído',
        description: 'O funcionário foi removido do sistema.',
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
    },
  });
}

// ============================================================
// HOOKS - STATUS UPDATE WITH OPTIMISTIC
// ============================================================

export function useUpdateEmployeeStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Employee['status'] }) => {
      const { data, error } = await supabase
        .from('employees')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.employees.lists() });

      const previousEmployees = queryClient.getQueryData<Employee[]>(
        queryKeys.employees.lists()
      );

      if (previousEmployees) {
        queryClient.setQueryData<Employee[]>(
          queryKeys.employees.lists(),
          previousEmployees.map((emp) =>
            emp.id === id ? { ...emp, status } : emp
          )
        );
      }

      return { previousEmployees };
    },

    onError: (err, _, context) => {
      if (context?.previousEmployees) {
        queryClient.setQueryData(
          queryKeys.employees.lists(),
          context.previousEmployees
        );
      }
      toast({
        title: 'Erro ao alterar status',
        description: err.message,
        variant: 'destructive',
      });
    },

    onSuccess: (data) => {
      const statusText = {
        active: 'ativado',
        inactive: 'desativado',
        suspended: 'suspenso',
      };
      toast({
        title: 'Status atualizado',
        description: `${data.name} foi ${statusText[data.status]}.`,
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    },
  });
}

// ============================================================
// HOOKS - BULK OPERATIONS
// ============================================================

export function useBulkUpdateEmployees() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: Partial<Employee> }) => {
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .in('id', ids)
        .select();

      if (error) throw error;
      return data;
    },

    onMutate: async ({ ids, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.employees.lists() });

      const previousEmployees = queryClient.getQueryData<Employee[]>(
        queryKeys.employees.lists()
      );

      if (previousEmployees) {
        queryClient.setQueryData<Employee[]>(
          queryKeys.employees.lists(),
          previousEmployees.map((emp) =>
            ids.includes(emp.id) ? { ...emp, ...updates } : emp
          )
        );
      }

      return { previousEmployees };
    },

    onError: (err, _, context) => {
      if (context?.previousEmployees) {
        queryClient.setQueryData(
          queryKeys.employees.lists(),
          context.previousEmployees
        );
      }
      toast({
        title: 'Erro na operação em lote',
        description: err.message,
        variant: 'destructive',
      });
    },

    onSuccess: (data) => {
      toast({
        title: 'Atualização em lote',
        description: `${data.length} funcionários foram atualizados.`,
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    },
  });
}
