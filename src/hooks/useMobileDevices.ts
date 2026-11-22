import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, queryPresets, invalidateRelated } from '@/lib/queryClient';

// ============================================================
// TYPES
// ============================================================

export interface MobileDevice {
  id: string;
  device_id: string;
  employee_name: string;
  device_model?: string;
  os_type: string;
  os_version?: string;
  app_version?: string;
  push_token?: string;
  last_location_lat?: number;
  last_location_lng?: number;
  is_active: boolean;
  last_seen_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DeviceLocation {
  device_id: string;
  employee_name: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

// ============================================================
// QUERIES
// ============================================================

export function useMobileDevices() {
  return useQuery({
    queryKey: queryKeys.mobileDevices.lists(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mobile_devices')
        .select('*')
        .order('last_seen_at', { ascending: false });

      if (error) throw error;
      return data as MobileDevice[];
    },
    ...queryPresets.list,
  });
}

export function useMobileDeviceLocations() {
  return useQuery({
    queryKey: queryKeys.mobileDevices.locations(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mobile_devices')
        .select('id, device_id, employee_name, last_location_lat, last_location_lng, last_seen_at')
        .eq('is_active', true)
        .not('last_location_lat', 'is', null);

      if (error) throw error;

      return (data || []).map((d) => ({
        device_id: d.device_id,
        employee_name: d.employee_name,
        latitude: d.last_location_lat ?? 0,
        longitude: d.last_location_lng ?? 0,
        timestamp: d.last_seen_at ?? '',
      })) as DeviceLocation[];
    },
    ...queryPresets.realtime,
  });
}

export function useMobileDevice(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.mobileDevices.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('mobile_devices')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as MobileDevice;
    },
    enabled: !!id,
    ...queryPresets.detail,
  });
}

// ============================================================
// MUTATIONS
// ============================================================

export function useUpdateMobileDevice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...input }: { id: string; is_active?: boolean }) => {
      const { data, error } = await supabase
        .from('mobile_devices')
        .update(input)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelated.mobileDevices(queryClient);
      toast({
        title: 'Dispositivo atualizado',
        description: 'O dispositivo foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar dispositivo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteMobileDevice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mobile_devices')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      invalidateRelated.mobileDevices(queryClient);
      toast({
        title: 'Dispositivo removido',
        description: 'O dispositivo foi removido com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao remover dispositivo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useSendPushNotification() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ deviceId, title, body }: { 
      deviceId: string; 
      title: string; 
      body: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: { device_id: deviceId, title, body },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Notificação enviada',
        description: 'A notificação push foi enviada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao enviar notificação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useRequestDeviceLocation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (deviceId: string) => {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: { 
          device_id: deviceId, 
          type: 'location_request',
          title: 'Atualização de localização',
          body: 'Atualizando sua localização...',
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Refetch locations after a delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: queryKeys.mobileDevices.locations() });
      }, 5000);
      
      toast({
        title: 'Solicitação enviada',
        description: 'A atualização de localização foi solicitada.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao solicitar localização',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
