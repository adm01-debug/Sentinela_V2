import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, queryPresets } from '@/lib/queryClient';

// ============================================================
// TYPES
// ============================================================

export interface RateLimitLog {
  id: string;
  endpoint: string;
  identifier: string;
  identifier_type: string;
  request_count: number;
  window_start: string;
  created_at: string;
}

export interface RateLimitStats {
  total_requests: number;
  blocked_requests: number;
  unique_ips: number;
  top_endpoints: { endpoint: string; count: number }[];
  top_ips: { ip: string; count: number }[];
}

// ============================================================
// QUERIES
// ============================================================
export function useRateLimitLogs(filters?: {
  endpoint?: string;
  identifier?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: [...queryKeys.rateLimiting.logs(), filters],
    queryFn: async () => {
      let query = supabase
        .from('rate_limit_logs')
        .select('id, endpoint, identifier, identifier_type, request_count, window_start, created_at')
        .order('window_start', { ascending: false })
        .limit(500);

      if (filters?.endpoint) {
        query = query.eq('endpoint', filters.endpoint);
      }
      if (filters?.identifier) {
        query = query.ilike('identifier', `%${filters.identifier}%`);
      }
      if (filters?.startDate) {
        query = query.gte('window_start', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('window_start', filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as RateLimitLog[];
    },
    ...queryPresets.list,
  });
}

export function useRateLimitStats() {
  return useQuery({
    queryKey: queryKeys.rateLimiting.stats(),
    queryFn: async () => {
      // Get logs from last 24 hours
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const [{ data: logs, error: logsError }, { data: alerts, error: alertsError }] =
        await Promise.all([
          supabase
            .from('rate_limit_logs')
            .select('endpoint, identifier, identifier_type, request_count')
            .gte('window_start', since),
          supabase
            .from('rate_limit_alerts')
            .select('ip')
            .gte('alerted_at', since),
        ]);

      if (logsError) throw logsError;
      if (alertsError) throw alertsError;

      const rows = (logs ?? []) as RateLimitLog[];
      const ipRows = rows.filter((d) => d.identifier_type === 'ip');

      const stats: RateLimitStats = {
        total_requests: rows.reduce((sum, d) => sum + (d.request_count ?? 0), 0),
        // rate_limit_logs não registra bloqueio: a evidência de estouro fica em rate_limit_alerts
        blocked_requests: alerts?.length ?? 0,
        unique_ips: new Set(ipRows.map((d) => d.identifier)).size,
        top_endpoints: [],
        top_ips: [],
      };

      const endpointCounts: Record<string, number> = {};
      rows.forEach((d) => {
        endpointCounts[d.endpoint] = (endpointCounts[d.endpoint] || 0) + (d.request_count ?? 0);
      });
      stats.top_endpoints = Object.entries(endpointCounts)
        .map(([endpoint, count]) => ({ endpoint, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const ipCounts: Record<string, number> = {};
      ipRows.forEach((d) => {
        ipCounts[d.identifier] = (ipCounts[d.identifier] || 0) + (d.request_count ?? 0);
      });
      stats.top_ips = Object.entries(ipCounts)
        .map(([ip, count]) => ({ ip, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return stats;
    },
    ...queryPresets.dashboard,
  });
}

export interface RateLimitAlert {
  id: string;
  ip: string;
  endpoint: string;
  request_count: number;
  threshold: number;
  window_seconds: number;
  alerted_at: string;
}

export function useRateLimitAlerts() {
  return useQuery({
    queryKey: queryKeys.rateLimiting.blockedIPs(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rate_limit_alerts')
        .select('id, ip, endpoint, request_count, threshold, window_seconds, alerted_at')
        .order('alerted_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      return (data ?? []) as RateLimitAlert[];
    },
    ...queryPresets.list,
  });
}