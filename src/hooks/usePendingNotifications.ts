import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { playNotificationSound } from '@/utils/notificationSound';

export interface PendingCounts {
  overtimeRequests: number;
  unreadViolations: number;
  total: number;
}

export function usePendingNotifications() {
  const queryClient = useQueryClient();
  const previousTotalRef = useRef<number | null>(null);

  const { data: counts = { overtimeRequests: 0, unreadViolations: 0, total: 0 }, isLoading } = useQuery({
    queryKey: ['pending-notifications'],
    queryFn: async (): Promise<PendingCounts> => {
      // Fetch pending overtime requests
      const { count: overtimeCount } = await supabase
        .from('overtime_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch unread violations
      const { count: violationsCount } = await supabase
        .from('security_violations')
        .select('*', { count: 'exact', head: true })
        .eq('read', false);

      const overtime = overtimeCount || 0;
      const violations = violationsCount || 0;

      return {
        overtimeRequests: overtime,
        unreadViolations: violations,
        total: overtime + violations
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Play sound when new notifications arrive
  useEffect(() => {
    if (previousTotalRef.current !== null && counts.total > previousTotalRef.current) {
      playNotificationSound();
    }
    previousTotalRef.current = counts.total;
  }, [counts.total]);

  // Listen for realtime changes
  useEffect(() => {
    const overtimeChannel = supabase
      .channel('sidebar-overtime-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'overtime_requests'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['pending-notifications'] });
        }
      )
      .subscribe();

    const violationsChannel = supabase
      .channel('sidebar-violations-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'security_violations'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['pending-notifications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(overtimeChannel);
      supabase.removeChannel(violationsChannel);
    };
  }, [queryClient]);

  return { counts, isLoading };
}
