import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, queryPresets, invalidateRelated } from '@/lib/queryClient';

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
  policy_id: string;
  employee_id: string;
  acknowledged_at: string;
  ip_address?: string;
  user_agent?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  screenshot_url?: string;
  policy?: Policy;
  employee?: {
    id: string;
    full_name: string;
    email: string;
    department?: string;
  };
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
    queryKey: queryKeys.policies.lists(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Policy[];
    },
    ...queryPresets.list,
  });
}

export function usePolicyAcknowledgments(filters?: {
  policyId?: string;
  employeeId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: queryKeys.policies.acknowledgments(),
    queryFn: async () => {
      let query = supabase
        .from('policy_acknowledgments')
        .select(\`
          *,
          policy:policies(id, name, version),
          employee:employees(id, full_name, email, department)
        \`)
        .order('acknowledged_at', { ascending: false });

      if (filters?.policyId) query = query.eq('policy_id', filters.policyId);
      if (filters?.employeeId) query = query.eq('employee_id', filters.employeeId);
      if (filters?.startDate) query = query.gte('acknowledged_at', filters.startDate);
      if (filters?.endDate) query = query.lte('acknowledged_at', filters.endDate);

      const { data, error } = await query;
      if (error) throw error;
      return data as PolicyAcknowledgment[];
    },
    ...queryPresets.list,
  });
}

export function usePendingAcknowledgments() {
  return useQuery({
    queryKey: queryKeys.policies.pending(),
    queryFn: async () => {
      // Get active policies that require acknowledgment
      const { data: policies, error: policiesError } = await supabase
        .from('policies')
        .select('id')
        .eq('is_active', true)
        .eq('requires_acknowledgment', true);

      if (policiesError) throw policiesError;

      // Get all employees
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('id, full_name, email')
        .eq('status', 'active');

      if (employeesError) throw employeesError;

      // Get acknowledgments
      const { data: acks, error: acksError } = await supabase
        .from('policy_acknowledgments')
        .select('policy_id, employee_id');

      if (acksError) throw acksError;

      // Calculate pending
      const ackSet = new Set(acks?.map(a => \`\${a.policy_id}-\${a.employee_id}\`) || []);
      const pending: { employee: typeof employees[0]; policyId: string }[] = [];

      for (const emp of employees || []) {
        for (const pol of policies || []) {
          if (!ackSet.has(\`\${pol.id}-\${emp.id}\`)) {
            pending.push({ employee: emp, policyId: pol.id });
          }
        }
      }

      return pending;
    },
    ...queryPresets.list,
  });
}

export function usePolicyStats() {
  return useQuery({
    queryKey: [...queryKeys.policies.all, 'stats'],
    queryFn: async () => {
      const [policiesRes, acksRes, employeesRes] = await Promise.all([
        supabase.from('policies').select('id, is_active, requires_acknowledgment'),
        supabase.from('policy_acknowledgments').select('id'),
        supabase.from('employees').select('id').eq('status', 'active'),
      ]);

      const policies = policiesRes.data || [];
      const acks = acksRes.data || [];
      const employees = employeesRes.data || [];

      const activePolicies = policies.filter(p => p.is_active);
      const requiringAck = policies.filter(p => p.is_active && p.requires_acknowledgment);
      
      const expectedAcks = requiringAck.length * employees.length;
      const actualAcks = acks.length;

      return {
        total_policies: policies.length,
        active_policies: activePolicies.length,
        total_acknowledgments: actualAcks,
        pending_acknowledgments: Math.max(0, expectedAcks - actualAcks),
        compliance_rate: expectedAcks > 0 ? (actualAcks / expectedAcks) * 100 : 100,
      } as PolicyStats;
    },
    ...queryPresets.dashboard,
  });
}

// ============================================================
// MUTATIONS
// ============================================================

export function useCreatePolicy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: Omit<Policy, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('policies')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelated.policies(queryClient);
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
    mutationFn: async ({ id, ...input }: { id: string } & Partial<Policy>) => {
      const { data, error } = await supabase
        .from('policies')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelated.policies(queryClient);
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
      const { error } = await supabase.from('policies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateRelated.policies(queryClient);
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
