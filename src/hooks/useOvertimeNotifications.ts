import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OvertimeRequest {
  id: string;
  employee_id: string;
  requested_date: string;
  start_time: string;
  end_time: string;
  reason: string | null;
  status: string;
  created_at: string;
}

export function useOvertimeNotifications() {
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for notification sound
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1sbWx6iJGSiHdwbnB4hoqLiHxzbm9zdH+FiId+dXJycHV7f4CBe3VycnJ0eHx9e3h1c3NzdXh6e3p4dnR0dHV3eXp5eHd2dXV1dnd4eXl4d3Z2dnZ3d3h4eHd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3');
    
    const channel = supabase
      .channel('overtime-requests-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'overtime_requests'
        },
        async (payload) => {
          console.log('New overtime request received:', payload);
          
          const newRequest = payload.new as OvertimeRequest;
          
          // Fetch employee name
          const { data: employee } = await supabase
            .from('employees')
            .select('name')
            .eq('id', newRequest.employee_id)
            .single();
          
          const employeeName = employee?.name || 'Colaborador';
          const formattedDate = format(new Date(newRequest.requested_date), "dd/MM/yyyy", { locale: ptBR });
          
          // Play notification sound
          if (audioRef.current) {
            audioRef.current.play().catch(() => {});
          }
          
          // Show toast notification
          toast.info(
            `Nova solicitação de hora extra`,
            {
              description: `${employeeName} solicitou hora extra para ${formattedDate} (${newRequest.start_time} - ${newRequest.end_time})`,
              duration: 10000,
              action: {
                label: 'Ver',
                onClick: () => {
                  // Scroll to overtime tab or navigate
                  const overtimeTab = document.querySelector('[value="overtime"]');
                  if (overtimeTab) {
                    (overtimeTab as HTMLElement).click();
                  }
                }
              }
            }
          );
          
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['overtime-requests'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'overtime_requests'
        },
        (payload) => {
          console.log('Overtime request updated:', payload);
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['overtime-requests'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
