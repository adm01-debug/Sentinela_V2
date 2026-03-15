import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

export interface SecurityCheck {
  id: string;
  name: string;
  weight: number;
  passed: boolean;
  description?: string;
}

export function useSecurityScore() {
  const query = useQuery({
    queryKey: ['security-score'],
    queryFn: async (): Promise<SecurityCheck[]> => {
      const [rlsRoles, blockedIps, geoSettings, mfa, policies, auditLog] = await Promise.all([
        supabase.from('user_roles').select('id', { count: 'exact', head: true }),
        supabase.from('blocked_ips').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('geo_blocking_settings').select('enabled').maybeSingle(),
        supabase.from('webauthn_credentials').select('id', { count: 'exact', head: true }),
        supabase.from('security_policies').select('id', { count: 'exact', head: true }).eq('enabled', true),
        supabase.from('settings_audit_log').select('id', { count: 'exact', head: true }),
      ]);

      return [
        { id: 'rbac', name: 'RBAC Configurado', weight: 20, passed: (rlsRoles.count ?? 0) > 0, description: 'Roles e permissões atribuídas' },
        { id: 'ip-blocking', name: 'IP Blocking Ativo', weight: 15, passed: (blockedIps.count ?? 0) > 0, description: 'IPs maliciosos bloqueados' },
        { id: 'geo-blocking', name: 'Geo Blocking', weight: 15, passed: geoSettings.data?.enabled === true, description: 'Restrição geográfica habilitada' },
        { id: 'mfa', name: 'MFA Habilitado', weight: 20, passed: (mfa.count ?? 0) > 0, description: 'Autenticação multi-fator configurada' },
        { id: 'policies', name: 'Políticas de Segurança', weight: 15, passed: (policies.count ?? 0) > 0, description: 'Políticas ativas configuradas' },
        { id: 'audit', name: 'Log de Auditoria', weight: 15, passed: (auditLog.count ?? 0) > 0, description: 'Ações administrativas registradas' },
      ];
    },
    staleTime: 120_000,
  });

  const checks = query.data ?? [];

  const { score, level } = useMemo(() => {
    const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
    const passedWeight = checks.filter(c => c.passed).reduce((sum, c) => sum + c.weight, 0);
    const score = totalWeight > 0 ? Math.round((passedWeight / totalWeight) * 100) : 0;
    const level = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'critical';
    return { score, level };
  }, [checks]);

  const passedChecks = useMemo(() => checks.filter(c => c.passed), [checks]);
  const failedChecks = useMemo(() => checks.filter(c => !c.passed), [checks]);

  return {
    score,
    level,
    checks,
    passedChecks,
    failedChecks,
    totalChecks: checks.length,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export default useSecurityScore;
