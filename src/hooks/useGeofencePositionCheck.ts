import { useCallback, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { geofenceService, type GeofenceCheckResponse } from "@/services/geofenceService";

export interface GeofencePositionArea {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

function parseCoordinate(raw: string, limit: number) {
  const value = Number(String(raw).replace(",", ".").trim());
  if (!Number.isFinite(value) || Math.abs(value) > limit) return null;
  return value;
}

export function useGeofencePositionCheck() {
  const [employeeId, setEmployeeId] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [result, setResult] = useState<GeofenceCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const employeesQuery = useQuery({
    queryKey: ["employees", "geofence-position-check"],
    queryFn: async () => {
      const { data, error: queryError } = await supabase
        .from("employees")
        .select("id, name, status")
        .order("name", { ascending: true })
        .limit(500);
      if (queryError) throw queryError;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const checkMutation = useMutation({
    mutationFn: (payload: { employee_id: string; latitude: number; longitude: number }) =>
      geofenceService.checkGeofence({
        employee_id: payload.employee_id,
        latitude: payload.latitude,
        longitude: payload.longitude,
        location: { latitude: payload.latitude, longitude: payload.longitude },
      }),
    onSuccess: (data) => {
      setError(null);
      setResult(data);
    },
    onError: (mutationError: Error) => {
      setResult(null);
      setError(mutationError.message || "Não foi possível verificar a posição.");
    },
  });

  const applyArea = useCallback((area: GeofencePositionArea) => {
    if (typeof area.latitude === "number") setLatitude(String(area.latitude));
    if (typeof area.longitude === "number") setLongitude(String(area.longitude));
  }, []);

  const submit = useCallback(() => {
    setError(null);
    if (!employeeId) {
      setError("Selecione um funcionário para verificar.");
      return;
    }
    const lat = parseCoordinate(latitude, 90);
    const lng = parseCoordinate(longitude, 180);
    if (lat === null || lng === null) {
      setError("Informe latitude e longitude válidas para testar a posição.");
      return;
    }
    checkMutation.mutate({ employee_id: employeeId, latitude: lat, longitude: lng });
  }, [employeeId, latitude, longitude, checkMutation]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    employees: employeesQuery.data ?? [],
    employeesLoading: employeesQuery.isLoading,
    employeeId,
    setEmployeeId,
    latitude,
    setLatitude,
    longitude,
    setLongitude,
    applyArea,
    submit,
    reset,
    isChecking: checkMutation.isPending,
    result,
    error,
  };
}

export default useGeofencePositionCheck;
