import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, queryPresets } from '@/lib/queryClient';

export interface MapMarker {
  id: string;
  longitude: number;
  latitude: number;
  title?: string;
  description?: string;
  color?: string;
  type?: 'employee' | 'geofence' | 'violation';
  data?: unknown;
}

export interface GeofenceZone {
  id: string;
  name: string;
  center: [number, number];
  radius: number;
  color?: string;
  fillOpacity?: number;
}

export interface HeatmapPoint {
  longitude: number;
  latitude: number;
  intensity?: number;
}

interface UseMapboxOptions {
  container: string;
  markers?: MapMarker[];
  geofences?: GeofenceZone[];
  heatmapData?: HeatmapPoint[];
  showHeatmap?: boolean;
  onMarkerClick?: (marker: MapMarker) => void;
}

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

export function useMapbox(options: UseMapboxOptions) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error] = useState<string | null>(null);

  const fitBounds = useCallback(() => {
    // Placeholder for fitBounds logic
  }, []);

  useEffect(() => {
    // Placeholder effect - actual implementation would initialize mapbox
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [options.container]);

  return {
    isLoaded,
    error,
    fitBounds,
  };
}
