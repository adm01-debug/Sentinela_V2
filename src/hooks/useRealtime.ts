import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export type RealtimeEntity = 'employees' | 'teams' | 'security_violations' | 'attendance_records';

export function useRealtime(entity: RealtimeEntity, queryKey: any[]) {
  const queryClient = useQueryClient();

  useEffect(() => {
    logger.info(`[Realtime] Subscribing to ${entity}`);
    
    const channel = supabase
      .channel(`public:${entity}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: entity },
        (payload) => {
          logger.info(`[Realtime] ${entity} changed`, payload);
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logger.info(`[Realtime] Successfully subscribed to ${entity}`);
        }
      });

    return () => {
      logger.info(`[Realtime] Unsubscribing from ${entity}`);
      supabase.removeChannel(channel);
    };
  }, [entity, queryKey, queryClient]);
}
