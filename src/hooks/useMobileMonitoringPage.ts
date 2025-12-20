import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface MobileDevice {
  id: string;
  device_id: string;
  employee_id: string;
  employee_name: string;
  device_model: string;
  os: string;
  os_version: string;
  app_version: string;
  last_location?: { lat: number; lng: number };
  last_seen: string;
  battery_level: number;
  is_charging: boolean;
  is_online: boolean;
}

export interface LocationHistory {
  id: string;
  device_id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  recorded_at: string;
}

export function useMobileMonitoringPage() {
  const [selectedDevice, setSelectedDevice] = useState<MobileDevice | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null);

  const { data: devices = [], isLoading: isLoadingDevices } = useQuery({
    queryKey: ['mobile-devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devices')
        .select(\`
          *,
          employees(name)
        \`)
        .eq('device_type', 'mobile')
        .order('last_seen', { ascending: false });
      
      if (error) throw error;

      return data.map(d => ({
        id: d.id,
        device_id: d.device_id,
        employee_id: d.employee_id,
        employee_name: d.employees?.name || 'Desconhecido',
        device_model: d.device_name || 'Mobile',
        os: d.os || 'Unknown',
        os_version: d.os_version || '',
        app_version: d.agent_version || '1.0.0',
        last_location: d.last_location,
        last_seen: d.last_seen,
        battery_level: d.battery_level || 0,
        is_charging: d.is_charging || false,
        is_online: d.is_online || false,
      })) as MobileDevice[];
    },
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const { data: locationHistory = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['location-history', selectedDevice?.device_id, dateRange],
    queryFn: async () => {
      if (!selectedDevice) return [];

      let query = supabase
        .from('employee_locations')
        .select('*')
        .eq('device_id', selectedDevice.device_id)
        .order('recorded_at', { ascending: false })
        .limit(100);

      if (dateRange?.from) {
        query = query.gte('recorded_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('recorded_at', dateRange.to.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      return data as LocationHistory[];
    },
    enabled: !!selectedDevice,
  });

  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      const matchesSearch = !searchTerm ||
        device.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.device_model.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'online' && device.is_online) ||
        (statusFilter === 'offline' && !device.is_online);

      return matchesSearch && matchesStatus;
    });
  }, [devices, searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    total: devices.length,
    online: devices.filter(d => d.is_online).length,
    offline: devices.filter(d => !d.is_online).length,
    lowBattery: devices.filter(d => d.battery_level < 20).length,
  }), [devices]);

  const handleSelectDevice = useCallback((device: MobileDevice | null) => {
    setSelectedDevice(device);
  }, []);

  return {
    selectedDevice,
    viewMode,
    setViewMode,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    autoRefresh,
    setAutoRefresh,
    dateRange,
    setDateRange,
    devices: filteredDevices,
    allDevices: devices,
    locationHistory,
    stats,
    isLoadingDevices,
    isLoadingHistory,
    handleSelectDevice,
  };
}
