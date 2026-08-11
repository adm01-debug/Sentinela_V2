import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export type RealtimeEntity = 'employees' | 'teams' | 'security_violations' | 'attendance_records';

export function useRealtime(entity: RealtimeEntity, queryKey: readonly unknown[]) {
  const queryClient = useQueryClient();
  const lastPayloadRef = useRef<string | null>(null);

  useEffect(() => {
    logger.debug(`[Realtime] Subscribing to ${entity}`);
    
    const channel = supabase
      .channel(`public:${entity}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: entity },
        (payload) => {
          const payloadStr = JSON.stringify(payload.new);
          if (payloadStr === lastPayloadRef.current) return;
          lastPayloadRef.current = payloadStr;
          
          logger.debug(`[Realtime] ${entity} changed`, payload);
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logger.debug(`[Realtime] Successfully subscribed to ${entity}`);
        }
      });

    return () => {
      logger.debug(`[Realtime] Unsubscribing from ${entity}`);
      supabase.removeChannel(channel);
    };
  }, [entity, queryKey, queryClient]);
}
