import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, queryPresets } from '@/lib/queryClient';

export function useMapboxToken() {
  return useQuery({
    queryKey: queryKeys.mapbox.token(),
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      if (error) throw error;
      return data.token as string;
    },
    ...queryPresets.immutable,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
