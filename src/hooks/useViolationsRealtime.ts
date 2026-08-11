import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ShieldAlert } from 'lucide-react';
import { createElement } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface ViolationRow {
  id: string;
  severity?: string | null;
  violation_type?: string | null;
  description?: string | null;
  employee_name?: string | null;
  created_at?: string | null;
}

const SEVERITY_LABEL: Record<string, string> = {
  critical: 'Crítica',
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

/**
 * Subscribe to new security_violations in real time and refresh the
 * violations queries. Shows a toast with the incoming violation.
 */
export function useViolationsRealtime(options?: { onInsert?: (row: ViolationRow) => void }) {
  const queryClient = useQueryClient();
  const onInsertRef = useRef(options?.onInsert);
  onInsertRef.current = options?.onInsert;

  useEffect(() => {
    const channel = supabase
      .channel('violations-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'security_violations' },
        (payload) => {
          const row = payload.new as ViolationRow;
          const sev = (row.severity ?? 'medium').toLowerCase();
          const sevLabel = SEVERITY_LABEL[sev] ?? sev;
          const title = `Nova violação · ${sevLabel}`;
          const desc = [row.employee_name, row.violation_type, row.description]
            .filter(Boolean)
            .join(' — ') || 'Sem detalhes';

          const toastFn =
            sev === 'critical' || sev === 'high' ? toast.error : toast.warning;

          toastFn(title, {
            description: desc,
            icon: createElement(ShieldAlert, { className: 'h-4 w-4' }),
            duration: 8000,
          });

          queryClient.invalidateQueries({ queryKey: ['violations'] });
          onInsertRef.current?.(row);
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'security_violations' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['violations'] });
        },
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          logger.warn('[ViolationsRealtime] channel status:', status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
