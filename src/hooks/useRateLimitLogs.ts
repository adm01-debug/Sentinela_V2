import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, queryPresets } from '@/lib/queryClient';

// ============================================================
// TYPES
// ============================================================

export interface RateLimitLog {
  id: string;
  endpoint: string;
  ip_address: string;
  user_id?: string;
  request_count: number;
  blocked: boolean;
  blocked_at?: string;
  created_at: string;
  user?: {
    email: string;
  };
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
  blocked?: boolean;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: queryKeys.rateLimiting.logs(),
    queryFn: async () => {
      let query = supabase
        .from('rate_limit_logs')
        .select(`
          *,
          user:users(email)
        `)
        .order('created_at', { ascending: false })
        .limit(500);

      if (filters?.endpoint) {
        query = query.eq('endpoint', filters.endpoint);
      }
      if (filters?.blocked !== undefined) {
        query = query.eq('blocked', filters.blocked);
      }
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as RateLimitLog[];
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

      const { data, error } = await supabase
        .from('rate_limit_logs')
        .select('endpoint, ip_address, blocked')
        .gte('created_at', since);

      if (error) throw error;

      // Calculate stats
      const stats: RateLimitStats = {
        total_requests: data.length,
        blocked_requests: data.filter(d => d.blocked).length,
        unique_ips: new Set(data.map(d => d.ip_address)).size,
        top_endpoints: [],
        top_ips: [],
      };

      // Calculate top endpoints
      const endpointCounts: Record<string, number> = {};
      data.forEach(d => {
        endpointCounts[d.endpoint] = (endpointCounts[d.endpoint] || 0) + 1;
      });
      stats.top_endpoints = Object.entries(endpointCounts)
        .map(([endpoint, count]) => ({ endpoint, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate top IPs
      const ipCounts: Record<string, number> = {};
      data.forEach(d => {
        ipCounts[d.ip_address] = (ipCounts[d.ip_address] || 0) + 1;
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

export function useBlockedIPs() {
  return useQuery({
    queryKey: queryKeys.rateLimiting.blockedIPs(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rate_limit_logs')
        .select('ip_address, blocked_at')
        .eq('blocked', true)
        .not('blocked_at', 'is', null)
        .order('blocked_at', { ascending: false });

      if (error) throw error;

      // Get unique IPs with their last block time
      const ipMap = new Map<string, string>();
      data.forEach(d => {
        if (!ipMap.has(d.ip_address)) {
          ipMap.set(d.ip_address, d.blocked_at);
        }
      });

      return Array.from(ipMap.entries()).map(([ip, blocked_at]) => ({
        ip_address: ip,
        blocked_at,
      }));
    },
    ...queryPresets.list,
  });
}
