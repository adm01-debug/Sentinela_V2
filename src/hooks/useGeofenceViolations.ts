import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys, queryPresets } from "@/lib/queryClient";

export interface GeofenceViolation {
  id: string;
  employee_name: string;
  device: string;
  latitude: number;
  longitude: number;
  detected_address: string;
  nearest_geofence_id: string;
  distance_meters: number;
  action_taken: string;
  created_at: string;
}

export interface GeofenceViolationFilters {
  employeeName?: string;
  device?: string;
  startDate?: string;
  endDate?: string;
}

export function useGeofenceViolations(filters?: GeofenceViolationFilters) {
  return useQuery({
    queryKey: [...queryKeys.geofences.all, "violations", filters],
    queryFn: async () => {
      let query = supabase
        .from("geofence_violations")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.employeeName) {
        query = query.ilike("employee_name", `%${filters.employeeName}%`);
      }
      if (filters?.device) {
        query = query.ilike("device", `%${filters.device}%`);
      }
      if (filters?.startDate) {
        query = query.gte("created_at", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("created_at", filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as GeofenceViolation[];
    },
    ...queryPresets.list,
  });
}
