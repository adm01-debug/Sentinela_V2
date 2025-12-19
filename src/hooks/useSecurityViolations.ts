import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { queryKeys, queryPresets, invalidateRelated } from '@/lib/queryClient';

// ============================================================
// TYPES
// ============================================================

export interface SecurityViolation {
  id: string;
  employee_id?: string;
  employee_name?: string;
  device_id?: string;
  violation_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  details?: Record<string, unknown>;
  is_read: boolean;
  status?: 'open' | 'acknowledged' | 'investigating' | 'resolved' | 'dismissed';
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface ViolationFilters {
  severity?: SecurityViolation['severity'];
  status?: SecurityViolation['status'];
  employee_id?: string;
  is_read?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

// ============================================================
// HOOKS
// ============================================================

/**
 * Lista violações com filtros opcionais
 */
export function useSecurityViolations(filters?: ViolationFilters) {
  return useQuery({
    queryKey: queryKeys.violations.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('security_violations')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.employee_id) {
        query = query.eq('employee_id', filters.employee_id);
      }
      if (filters?.is_read !== undefined) {
        query = query.eq('is_read', filters.is_read);
      }
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as SecurityViolation[];
    },
    ...queryPresets.list,
  });
}

/**
 * Busca uma violação específica
 */
export function useViolation(id: string) {
  return useQuery({
    queryKey: queryKeys.violations.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_violations')
        .select('*, employees(name, email, department)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as SecurityViolation & { 
        employees?: { name: string; email: string; department: string } 
      };
    },
    enabled: !!id,
    ...queryPresets.list,
  });
}

/**
 * Contagem de violações não lidas
 */
export function useUnreadViolationsCount() {
  return useQuery({
    queryKey: queryKeys.violations.unread(),
    queryFn: async () => {
      const { count, error } = await supabase
        .from('security_violations')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    },
    ...queryPresets.realtime,
  });
}

/**
 * Marcar violação como lida
 */
export function useMarkViolationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('security_violations')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, id) => {
      invalidateRelated.violation(queryClient, id);
    },
  });
}

/**
 * Marcar todas como lidas
 */
export function useMarkAllViolationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('security_violations')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      invalidateRelated.violation(queryClient);
      toast.success('Todas as violações marcadas como lidas');
    },
  });
}

/**
 * Atualizar status da violação
 */
export function useUpdateViolationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      status 
    }: { 
      id: string; 
      status: SecurityViolation['status'] 
    }) => {
      const updates: Partial<SecurityViolation> = { status };
      
      if (status === 'resolved' || status === 'dismissed') {
        updates.resolved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('security_violations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { id }) => {
      invalidateRelated.violation(queryClient, id);
      toast.success('Status atualizado!');
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });
}

/**
 * Estatísticas de violações
 */
export function useViolationStats() {
  return useQuery({
    queryKey: [...queryKeys.violations.all, 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_violations')
        .select('severity, status, is_read');

      if (error) throw error;

      const violations = data || [];
      
      return {
        total: violations.length,
        unread: violations.filter(v => !v.is_read).length,
        open: violations.filter(v => v.status === 'open' || !v.status).length,
        critical: violations.filter(v => v.severity === 'critical').length,
        high: violations.filter(v => v.severity === 'high').length,
        medium: violations.filter(v => v.severity === 'medium').length,
        low: violations.filter(v => v.severity === 'low').length,
        resolved: violations.filter(v => v.status === 'resolved').length,
      };
    },
    ...queryPresets.list,
  });
}
