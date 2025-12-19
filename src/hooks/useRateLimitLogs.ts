import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  totalRequests: number;
  blockedRequests: number;
  uniqueIdentifiers: number;
  topEndpoints: { endpoint: string; count: number }[];
  topIdentifiers: { identifier: string; count: number; identifier_type: string }[];
  requestsByHour: { hour: string; count: number }[];
}

export const useRateLimitLogs = (timeRange: '1h' | '24h' | '7d' = '24h') => {
  return useQuery({
    queryKey: ['rate-limit-logs', timeRange],
    queryFn: async () => {
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
      }

      const { data, error } = await supabase
        .from('rate_limit_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RateLimitLog[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useRateLimitStats = (timeRange: '1h' | '24h' | '7d' = '24h') => {
  const { data: logs, isLoading, error } = useRateLimitLogs(timeRange);

  const stats: RateLimitStats = {
    totalRequests: 0,
    blockedRequests: 0,
    uniqueIdentifiers: 0,
    topEndpoints: [],
    topIdentifiers: [],
    requestsByHour: [],
  };

  if (logs) {
    stats.totalRequests = logs.reduce((sum, log) => sum + (log.request_count || 1), 0);
    
    // Count unique identifiers
    const uniqueIds = new Set(logs.map(log => log.identifier));
    stats.uniqueIdentifiers = uniqueIds.size;

    // Estimate blocked requests (requests that exceeded limits)
    // We consider high request counts as potential blocked attempts
    stats.blockedRequests = logs.filter(log => (log.request_count || 1) > 50).length;

    // Top endpoints
    const endpointCounts: Record<string, number> = {};
    logs.forEach(log => {
      endpointCounts[log.endpoint] = (endpointCounts[log.endpoint] || 0) + (log.request_count || 1);
    });
    stats.topEndpoints = Object.entries(endpointCounts)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top identifiers (potential attackers)
    const identifierCounts: Record<string, { count: number; type: string }> = {};
    logs.forEach(log => {
      if (!identifierCounts[log.identifier]) {
        identifierCounts[log.identifier] = { count: 0, type: log.identifier_type };
      }
      identifierCounts[log.identifier].count += log.request_count || 1;
    });
    stats.topIdentifiers = Object.entries(identifierCounts)
      .map(([identifier, { count, type }]) => ({ identifier, count, identifier_type: type }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Requests by hour
    const hourCounts: Record<string, number> = {};
    logs.forEach(log => {
      const hour = new Date(log.created_at).toISOString().slice(0, 13) + ':00';
      hourCounts[hour] = (hourCounts[hour] || 0) + (log.request_count || 1);
    });
    stats.requestsByHour = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
  }

  return { stats, isLoading, error };
};
