import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCallback, useMemo } from 'react';

interface Violation {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  employee_id: string | null;
  description: string | null;
  created_at: string;
}

export function useViolations(filters?: { severity?: string; status?: string; employeeId?: string }) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['violations', filters],
    queryFn: async (): Promise<Violation[]> => {
      let q = supabase
        .from('security_violations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (filters?.severity) q = q.eq('severity', filters.severity);
      if (filters?.status) q = q.eq('status', filters.status);
      if (filters?.employeeId) q = q.eq('employee_id', filters.employeeId);

      const { data, error } = await q;
      if (error) throw error;

      return (data ?? []).map((row): Violation => ({
        id: row.id,
        type: row.violation_type ?? row.rule_id ?? 'unknown',
        severity: (row.severity as Violation['severity']) ?? 'medium',
        status: row.status ?? 'open',
        employee_id: row.employee_id,
        description: row.description,
        created_at: row.created_at,
      }));
    },
    staleTime: 30_000,
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('security_violations')
        .update({ status: 'resolved' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['violations'] }),
  });

  const violations = query.data ?? [];
  const unresolved = useMemo(() => violations.filter(v => v.status !== 'resolved'), [violations]);
  const critical = useMemo(() => violations.filter(v => v.severity === 'critical' && v.status !== 'resolved'), [violations]);

  const resolve = useCallback((id: string) => resolveMutation.mutate(id), [resolveMutation]);

  return {
    violations,
    unresolved,
    critical,
    resolve,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
