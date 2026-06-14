import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { violationService } from '@/services/violationService';

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
      const data = await violationService.getViolations(filters);

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
    mutationFn: (id: any) => violationService.resolveViolation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['violations'] }),
  });

  const violations = query.data ?? [];
  const unresolved = useMemo(() => violations.filter(v => v.status !== 'resolved'), [violations]);
  const critical = useMemo(() => violations.filter(v => v.severity === 'critical' && v.status !== 'resolved'), [violations]);

  const resolve = useCallback((id: any) => resolveMutation.mutate(id), [resolveMutation]);

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
