import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface MobileDevice {
  id: string;
  employee_name: string;
  device_id: string;
  device_model: string | null;
  os_type: "android" | "ios";
  os_version: string | null;
  app_version: string | null;
  push_token: string | null;
  last_location_lat: number | null;
  last_location_lng: number | null;
  last_seen_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MobileActivityLog {
  id: string;
  device_id: string | null;
  employee_name: string;
  activity_type: string;
  app_name: string | null;
  duration_seconds: number | null;
  latitude: number | null;
  longitude: number | null;
  metadata: Record<string, any> | null;
  recorded_at: string;
  created_at: string;
}

export function useMobileDevices() {
  const [devices, setDevices] = useState<MobileDevice[]>([]);
  const [activityLogs, setActivityLogs] = useState<MobileActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDevices = async () => {
    try {
      const { data, error } = await supabase
        .from("mobile_devices")
        .select("*")
        .order("last_seen_at", { ascending: false });

      if (error) throw error;
      setDevices((data as MobileDevice[]) || []);
    } catch (error: any) {
      console.error("Error fetching mobile devices:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dispositivos móveis",
        variant: "destructive",
      });
    }
  };

  const fetchActivityLogs = async (limit = 50) => {
    try {
      const { data, error } = await supabase
        .from("mobile_activity_logs")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      setActivityLogs((data as MobileActivityLog[]) || []);
    } catch (error: any) {
      console.error("Error fetching mobile activity logs:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchDevices(), fetchActivityLogs()]);
      setLoading(false);
    };
    loadData();

    // Subscribe to realtime updates for devices
    const devicesChannel = supabase
      .channel("mobile-devices-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "mobile_devices",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setDevices((prev) => [payload.new as MobileDevice, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setDevices((prev) =>
              prev.map((device) =>
                device.id === payload.new.id ? (payload.new as MobileDevice) : device
              )
            );
          } else if (payload.eventType === "DELETE") {
            setDevices((prev) =>
              prev.filter((device) => device.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Subscribe to realtime updates for activity logs
    const activityChannel = supabase
      .channel("mobile-activity-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mobile_activity_logs",
        },
        (payload) => {
          setActivityLogs((prev) => [payload.new as MobileActivityLog, ...prev.slice(0, 49)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(devicesChannel);
      supabase.removeChannel(activityChannel);
    };
  }, []);

  const toggleDeviceStatus = async (deviceId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("mobile_devices")
        .update({ is_active: isActive })
        .eq("id", deviceId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Dispositivo ${isActive ? "ativado" : "desativado"}`,
      });

      await fetchDevices();
    } catch (error: any) {
      console.error("Error toggling device status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do dispositivo",
        variant: "destructive",
      });
    }
  };

  const deleteDevice = async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from("mobile_devices")
        .delete()
        .eq("id", deviceId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Dispositivo removido",
      });

      await fetchDevices();
    } catch (error: any) {
      console.error("Error deleting device:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o dispositivo",
        variant: "destructive",
      });
    }
  };

  return {
    devices,
    activityLogs,
    loading,
    toggleDeviceStatus,
    deleteDevice,
    refetch: () => Promise.all([fetchDevices(), fetchActivityLogs()]),
  };
}
