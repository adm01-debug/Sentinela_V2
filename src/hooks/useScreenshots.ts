import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useScreenshots = (employeeId: string, date: string) => {
  return useQuery({
    queryKey: ['screenshots', employeeId, date],
    queryFn: async () => [] as any[],
    enabled: !!employeeId && !!date,
  });
};

export const useDeleteScreenshot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_id: string) => { return; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['screenshots'] }); },
  });
};
