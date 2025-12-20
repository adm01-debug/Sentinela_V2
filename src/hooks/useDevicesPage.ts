import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/queryClient';

interface Device {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  os_version: string;
  last_seen: string;
  is_active: boolean;
  employee_id: string;
  employee?: {
    name: string;
    email: string;
  };
  agent_version: string;
  ip_address: string;
  location?: string;
}

interface FilterState {
  type: string;
  status: string;
  search: string;
}

export function useDevicesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    status: 'all',
    search: '',
  });

  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fetch devices
  const devicesQuery = useQuery({
    queryKey: queryKeys.devices.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('devices')
        .select(\`
          *,
          employee:employees(name, email)
        \`)
        .order('last_seen', { ascending: false });

      if (filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      if (filters.status !== 'all') {
        query = query.eq('is_active', filters.status === 'active');
      }
      if (filters.search) {
        query = query.or(\`name.ilike.%\${filters.search}%,ip_address.ilike.%\${filters.search}%\`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Device[];
    },
  });

  // Stats computation
  const stats = useMemo(() => {
    const devices = devicesQuery.data || [];
    const total = devices.length;
    const active = devices.filter(d => d.is_active).length;
    const desktop = devices.filter(d => d.type === 'desktop').length;
    const mobile = devices.filter(d => d.type === 'mobile').length;
    const needsUpdate = devices.filter(d => {
      // Simplified version check
      return d.agent_version < '2.0.0';
    }).length;

    return { total, active, desktop, mobile, needsUpdate };
  }, [devicesQuery.data]);

  // Deactivate device mutation
  const deactivateMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      const { error } = await supabase
        .from('devices')
        .update({ is_active: false })
        .eq('id', deviceId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.all });
      toast({ title: 'Dispositivo desativado com sucesso' });
      setIsDetailsOpen(false);
    },
    onError: () => {
      toast({ title: 'Erro ao desativar dispositivo', variant: 'destructive' });
    },
  });

  // Reactivate device mutation
  const reactivateMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      const { error } = await supabase
        .from('devices')
        .update({ is_active: true })
        .eq('id', deviceId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.all });
      toast({ title: 'Dispositivo reativado com sucesso' });
    },
    onError: () => {
      toast({ title: 'Erro ao reativar dispositivo', variant: 'destructive' });
    },
  });

  // Delete device mutation
  const deleteMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      const { error } = await supabase
        .from('devices')
        .delete()
        .eq('id', deviceId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.all });
      toast({ title: 'Dispositivo removido com sucesso' });
      setIsDetailsOpen(false);
    },
    onError: () => {
      toast({ title: 'Erro ao remover dispositivo', variant: 'destructive' });
    },
  });

  // Handlers
  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleViewDetails = useCallback((device: Device) => {
    setSelectedDevice(device);
    setIsDetailsOpen(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setIsDetailsOpen(false);
    setSelectedDevice(null);
  }, []);

  const handleDeactivate = useCallback((deviceId: string) => {
    deactivateMutation.mutate(deviceId);
  }, [deactivateMutation]);

  const handleReactivate = useCallback((deviceId: string) => {
    reactivateMutation.mutate(deviceId);
  }, [reactivateMutation]);

  const handleDelete = useCallback((deviceId: string) => {
    deleteMutation.mutate(deviceId);
  }, [deleteMutation]);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.devices.all });
  }, [queryClient]);

  return {
    // Data
    devices: devicesQuery.data || [],
    stats,
    filters,
    selectedDevice,
    isDetailsOpen,
    
    // Loading states
    isLoading: devicesQuery.isLoading,
    isRefreshing: devicesQuery.isFetching,
    
    // Handlers
    handleFilterChange,
    handleViewDetails,
    handleCloseDetails,
    handleDeactivate,
    handleReactivate,
    handleDelete,
    handleRefresh,
    
    // Mutation states
    isDeactivating: deactivateMutation.isPending,
    isReactivating: reactivateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
