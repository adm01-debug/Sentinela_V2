import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// ============================================================
// TYPES
// ============================================================

export interface Policy {
  id: string;
  name: string;
  description?: string;
  content: string;
  version: string;
  is_active: boolean;
  requires_acknowledgment: boolean;
  created_at: string;
  updated_at: string;
}

export interface PolicyAcknowledgment {
  id: string;
  employee_name: string;
  acknowledged_at: string;
  ip_address?: string;
  device_name?: string;
  latitude?: number;
  longitude?: number;
  location_address?: string;
  photo_url?: string;
  policy_version?: string;
}

export interface PolicyStats {
  total_policies: number;
  active_policies: number;
  total_acknowledgments: number;
  pending_acknowledgments: number;
  compliance_rate: number;
}

// ============================================================
// QUERIES
// ============================================================

export function usePolicies() {
  return useQuery({
    queryKey: ['policies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_policies')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        content: p.description || '',
        version: '1.0',
        is_active: p.enabled,
        requires_acknowledgment: true,
        created_at: p.created_at,
        updated_at: p.updated_at,
      })) as Policy[];
    },
  });
}

export function usePolicyAcknowledgments(filters?: {
  policyId?: string;
  employeeId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['policy-acknowledgments', filters],
    queryFn: async () => {
      let query = supabase
        .from('policy_acknowledgments')
        .select('*')
        .order('acknowledged_at', { ascending: false });

      if (filters?.startDate) query = query.gte('acknowledged_at', filters.startDate);
      if (filters?.endDate) query = query.lte('acknowledged_at', filters.endDate);

      const { data, error } = await query;
      if (error) throw error;
      return data as PolicyAcknowledgment[];
    },
  });
}

export function usePendingAcknowledgments() {
  return useQuery({
    queryKey: ['pending-acknowledgments'],
    queryFn: async () => {
      // Get active policies that require acknowledgment
      const { data: policies, error: policiesError } = await supabase
        .from('security_policies')
        .select('id')
        .eq('enabled', true);

      if (policiesError) throw policiesError;

      // Get all employees
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('id, name, email')
        .eq('status', 'active');

      if (employeesError) throw employeesError;

      // Get acknowledgments
      const { data: acks, error: acksError } = await supabase
        .from('policy_acknowledgments')
        .select('employee_name');

      if (acksError) throw acksError;

      // Calculate pending
      const ackSet = new Set(acks?.map(a => a.employee_name) || []);
      const pending: { employee: { id: string; name: string; email: string | null }; policyId: string }[] = [];

      for (const emp of employees || []) {
        if (!ackSet.has(emp.name)) {
          for (const pol of policies || []) {
            pending.push({ employee: { id: emp.id, name: emp.name, email: emp.email }, policyId: pol.id });
          }
        }
      }

      return pending;
    },
  });
}

export function usePolicyStats() {
  return useQuery({
    queryKey: ['policy-stats'],
    queryFn: async () => {
      const [policiesRes, acksRes, employeesRes] = await Promise.all([
        supabase.from('security_policies').select('id, enabled'),
        supabase.from('policy_acknowledgments').select('id'),
        supabase.from('employees').select('id').eq('status', 'active'),
      ]);

      const policies = policiesRes.data || [];
      const acks = acksRes.data || [];
      const employees = employeesRes.data || [];

      const activePolicies = policies.filter(p => p.enabled);
      
      const expectedAcks = activePolicies.length * employees.length;
      const actualAcks = acks.length;

      return {
        total_policies: policies.length,
        active_policies: activePolicies.length,
        total_acknowledgments: actualAcks,
        pending_acknowledgments: Math.max(0, expectedAcks - actualAcks),
        compliance_rate: expectedAcks > 0 ? (actualAcks / expectedAcks) * 100 : 100,
      } as PolicyStats;
    },
  });
}

// ============================================================
// MUTATIONS
// ============================================================

export function useCreatePolicy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: { name: string; description: string; category: string }) => {
      const { data, error } = await supabase
        .from('security_policies')
        .insert({
          name: input.name,
          description: input.description,
          category: input.category,
          enabled: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast({ title: 'Política criada com sucesso' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar política', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdatePolicy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...input }: { id: string; name?: string; description?: string; enabled?: boolean }) => {
      const { data, error } = await supabase
        .from('security_policies')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast({ title: 'Política atualizada' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeletePolicy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('security_policies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast({ title: 'Política excluída' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    },
  });
}

export function useRequestAcknowledgment() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ policyId, employeeIds }: { policyId: string; employeeIds: string[] }) => {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          employee_ids: employeeIds,
          type: 'policy_acknowledgment',
          data: { policy_id: policyId },
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Solicitação enviada' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao enviar', description: error.message, variant: 'destructive' });
    },
  });
}