import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface MobileDevice {
  id: string;
  device_id: string;
  employee_name: string;
  device_model: string;
  os: string;
  os_version: string;
  app_version: string;
  last_location?: { lat: number; lng: number };
  last_seen: string | null;
  is_online: boolean;
}

export interface MobileActivity {
  id: string;
  activity_type: string;
  app_name: string | null;
  duration_seconds: number | null;
  latitude: number | null;
  longitude: number | null;
  recorded_at: string;
}

export function useMobileMonitoringPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedDevice, setSelectedDevice] = useState<MobileDevice | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [sessionStart] = useState(() => Date.now());

  const {
    data: devices = [],
    isLoading: isLoadingDevices,
    isError: isErrorDevices,
  } = useQuery({
    queryKey: ["mobile-devices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mobile_devices")
        .select("*")
        .order("last_seen_at", { ascending: false });

      if (error) throw error;

      return (data ?? []).map((d) => ({
        id: d.id,
        device_id: d.device_id,
        employee_name: d.employee_name || "Desconhecido",
        device_model: d.device_model || "Mobile",
        os: d.os_type || "Unknown",
        os_version: d.os_version || "",
        app_version: d.app_version || "",
        last_location:
          d.last_location_lat != null && d.last_location_lng != null
            ? { lat: d.last_location_lat, lng: d.last_location_lng }
            : undefined,
        last_seen: d.last_seen_at,
        is_online: d.is_active,
      })) as MobileDevice[];
    },
    refetchInterval: autoRefresh ? 30000 : false,
  });

  // mobile_activity_logs.device_id e FK para mobile_devices.id, nao para o
  // identificador textual do aparelho.
  const {
    data: activities = [],
    isLoading: isLoadingActivities,
    isError: isErrorActivities,
  } = useQuery({
    queryKey: ["mobile-activity-logs", selectedDevice?.id],
    queryFn: async () => {
      if (!selectedDevice) return [];

      const { data, error } = await supabase
        .from("mobile_activity_logs")
        .select("*")
        .eq("device_id", selectedDevice.id)
        .order("recorded_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      return (data ?? []) as MobileActivity[];
    },
    enabled: !!selectedDevice,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("mobile_devices").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mobile-devices"] });
      toast({
        title: variables.is_active ? "Dispositivo reativado" : "Dispositivo desativado",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar o dispositivo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredDevices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return devices.filter((device) => {
      const matchesSearch =
        !term ||
        device.employee_name.toLowerCase().includes(term) ||
        device.device_model.toLowerCase().includes(term) ||
        device.device_id.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "online" && device.is_online) ||
        (statusFilter === "offline" && !device.is_online);

      return matchesSearch && matchesStatus;
    });
  }, [devices, searchTerm, statusFilter]);

  const stats = useMemo(
    () => ({
      total: devices.length,
      online: devices.filter((d) => d.is_online).length,
      offline: devices.filter((d) => !d.is_online).length,
      seenToday: devices.filter(
        (d) => d.last_seen && sessionStart - new Date(d.last_seen).getTime() < 24 * 60 * 60 * 1000
      ).length,
    }),
    [devices, sessionStart]
  );

  const handleSelectDevice = useCallback((device: MobileDevice | null) => {
    setSelectedDevice(device);
  }, []);

  const handleToggleActive = useCallback(
    (device: MobileDevice) => {
      toggleActiveMutation.mutate({ id: device.id, is_active: !device.is_online });
    },
    [toggleActiveMutation]
  );

  return {
    selectedDevice,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    autoRefresh,
    setAutoRefresh,
    devices: filteredDevices,
    allDevices: devices,
    activities,
    stats,
    isLoadingDevices,
    isErrorDevices,
    isLoadingActivities,
    isErrorActivities,
    handleSelectDevice,
    handleToggleActive,
    isToggling: toggleActiveMutation.isPending,
  };
}
