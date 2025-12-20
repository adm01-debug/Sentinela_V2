import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/queryClient';

interface RateLimitLog {
  id: string;
  ip_address: string;
  endpoint: string;
  request_count: number;
  blocked: boolean;
  created_at: string;
  company_id: string;
}

interface RateLimitSettings {
  id: string;
  endpoint: string;
  max_requests: number;
  window_seconds: number;
  block_duration_seconds: number;
  enabled: boolean;
}

interface FilterState {
  endpoint: string;
  blocked: string;
  search: string;
  dateRange: { from: Date | null; to: Date | null };
}

export function useRateLimitDashboardPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<FilterState>({
    endpoint: 'all',
    blocked: 'all',
    search: '',
    dateRange: { from: null, to: null },
  });

  // Fetch rate limit logs
  const logsQuery = useQuery({
    queryKey: queryKeys.rateLimitLogs.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('rate_limit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filters.endpoint !== 'all') {
        query = query.eq('endpoint', filters.endpoint);
      }
      if (filters.blocked !== 'all') {
        query = query.eq('blocked', filters.blocked === 'true');
      }
      if (filters.search) {
        query = query.ilike('ip_address', `%${filters.search}%`);
      }
      if (filters.dateRange.from) {
        query = query.gte('created_at', filters.dateRange.from.toISOString());
      }
      if (filters.dateRange.to) {
        query = query.lte('created_at', filters.dateRange.to.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as RateLimitLog[];
    },
  });

  // Fetch settings
  const settingsQuery = useQuery({
    queryKey: queryKeys.rateLimitSettings.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rate_limit_settings')
        .select('*')
        .order('endpoint');
      if (error) throw error;
      return data as RateLimitSettings[];
    },
  });

  // Fetch blocked IPs
  const blockedIPsQuery = useQuery({
    queryKey: queryKeys.blockedIPs.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blocked_ips')
        .select('*')
        .order('blocked_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Stats computation
  const stats = useMemo(() => {
    const logs = logsQuery.data || [];
    const totalRequests = logs.reduce((sum, log) => sum + log.request_count, 0);
    const blockedRequests = logs.filter(l => l.blocked).length;
    const uniqueIPs = new Set(logs.map(l => l.ip_address)).size;
    const topEndpoints = logs.reduce((acc, log) => {
      acc[log.endpoint] = (acc[log.endpoint] || 0) + log.request_count;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRequests,
      blockedRequests,
      blockedPercentage: totalRequests > 0 ? (blockedRequests / logs.length * 100).toFixed(1) : '0',
      uniqueIPs,
      topEndpoints: Object.entries(topEndpoints)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    };
  }, [logsQuery.data]);

  // Unblock IP mutation
  const unblockIPMutation = useMutation({
    mutationFn: async (ip: string) => {
      const { error } = await supabase
        .from('blocked_ips')
        .delete()
        .eq('ip_address', ip);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blockedIPs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.rateLimitLogs.all });
      toast({ title: 'IP desbloqueado com sucesso' });
    },
    onError: () => {
      toast({ title: 'Erro ao desbloquear IP', variant: 'destructive' });
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<RateLimitSettings> & { id: string }) => {
      const { error } = await supabase
        .from('rate_limit_settings')
        .update(settings)
        .eq('id', settings.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rateLimitSettings.all });
      toast({ title: 'Configurações atualizadas' });
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar configurações', variant: 'destructive' });
    },
  });

  // Handlers
  const handleFilterChange = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleUnblockIP = useCallback((ip: string) => {
    unblockIPMutation.mutate(ip);
  }, [unblockIPMutation]);

  const handleUpdateSettings = useCallback((settings: Partial<RateLimitSettings> & { id: string }) => {
    updateSettingsMutation.mutate(settings);
  }, [updateSettingsMutation]);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.rateLimitLogs.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.blockedIPs.all });
  }, [queryClient]);

  return {
    // Data
    logs: logsQuery.data || [],
    settings: settingsQuery.data || [],
    blockedIPs: blockedIPsQuery.data || [],
    stats,
    filters,
    
    // Loading states
    isLoading: logsQuery.isLoading || settingsQuery.isLoading,
    isRefreshing: logsQuery.isFetching,
    
    // Handlers
    handleFilterChange,
    handleUnblockIP,
    handleUpdateSettings,
    handleRefresh,
    
    // Mutation states
    isUnblocking: unblockIPMutation.isPending,
    isUpdating: updateSettingsMutation.isPending,
  };
}
