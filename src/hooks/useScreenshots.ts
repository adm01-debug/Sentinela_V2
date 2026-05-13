import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Screenshot {
  id: string;
  employee_name: string;
  url: string;
  thumbnail_url?: string;
  captured_at: string;
  app_name?: string;
  window_title?: string;
}

export const useScreenshots = (employeeId: string, date: string) => {
  return useQuery({
    queryKey: ['screenshots', employeeId, date],
    queryFn: async () => [] as Screenshot[],
    enabled: !!employeeId && !!date,
  });
};

export const useDeleteScreenshot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_id: any) => { return; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['screenshots'] }); },
  });
};

export const useScreenshot = (id: string | null | undefined) => {
  return useQuery({
    queryKey: ['screenshot', id],
    queryFn: async () => null as Screenshot | null,
    enabled: !!id,
  });
};
