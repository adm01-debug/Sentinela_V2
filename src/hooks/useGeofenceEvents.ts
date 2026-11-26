import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GeofenceEventRow {
  id: string;
  employee_id: string;
  device_id: string;
  geofence_id: string;
  event_type: string;
  occurred_at: string;
  employee_name: string;
  geofence_name: string;
}

export interface GeofenceInsideRow {
  employee_id: string;
  device_id: string;
  geofence_id: string;
  last_checked: string | null;
  employee_name: string;
  geofence_name: string;
}

const UNKNOWN_EMPLOYEE = "Funcionário não identificado";
const REMOVED_AREA = "Área removida";

export function useGeofenceEvents(limit = 200) {
  const eventsQuery = useQuery({
    queryKey: ["geofence_events", "recent", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("geofence_events")
        .select("id, employee_id, device_id, geofence_id, event_type, occurred_at")
        .order("occurred_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60 * 1000,
  });

  const insideQuery = useQuery({
    queryKey: ["geofence_states", "inside"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("geofence_states")
        .select("employee_id, device_id, geofence_id, is_inside, last_checked")
        .eq("is_inside", true)
        .order("last_checked", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60 * 1000,
  });

  const namesQuery = useQuery({
    queryKey: ["geofence_events", "names"],
    queryFn: async () => {
      const [employees, geofences] = await Promise.all([
        supabase.from("employees").select("id, name").limit(1000),
        supabase.from("geofences").select("id, name").limit(500),
      ]);
      if (employees.error) throw employees.error;
      if (geofences.error) throw geofences.error;
      return {
        employees: new Map((employees.data ?? []).map((row) => [row.id, row.name])),
        geofences: new Map((geofences.data ?? []).map((row) => [row.id, row.name])),
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const names = namesQuery.data;

  const events: GeofenceEventRow[] = (eventsQuery.data ?? []).map((event) => ({
    ...event,
    employee_name: names?.employees.get(event.employee_id) ?? UNKNOWN_EMPLOYEE,
    geofence_name: names?.geofences.get(event.geofence_id) ?? REMOVED_AREA,
  }));

  const inside: GeofenceInsideRow[] = (insideQuery.data ?? []).map((state) => ({
    employee_id: state.employee_id,
    device_id: state.device_id,
    geofence_id: state.geofence_id,
    last_checked: state.last_checked,
    employee_name: names?.employees.get(state.employee_id) ?? UNKNOWN_EMPLOYEE,
    geofence_name: names?.geofences.get(state.geofence_id) ?? REMOVED_AREA,
  }));

  return {
    events,
    inside,
    isLoading: eventsQuery.isLoading || insideQuery.isLoading || namesQuery.isLoading,
    error: (eventsQuery.error ?? insideQuery.error ?? namesQuery.error) as Error | null,
    refetch: () => {
      void eventsQuery.refetch();
      void insideQuery.refetch();
    },
  };
}

export default useGeofenceEvents;
