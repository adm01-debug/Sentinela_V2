import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface DeviceStats {
  totalDevices: number;
  desktops: number;
  mobiles: number;
  online: number;
  offline: number;
  blockedAttempts: number;
  alertsToday: number;
}

interface EmployeeDeviceStatsRow {
  device_type: string | null;
  is_active: boolean | null;
}

interface MobileDeviceStatsRow {
  is_active: boolean | null;
  last_seen_at: string | null;
}

async function fetchDeviceStats(): Promise<DeviceStats> {
  // Buscar dispositivos dos funcionários
  const { data: devices, error: devicesError } = await supabase
    .from('employee_devices')
    .select('device_type, is_active');

  if (devicesError) {
    logger.error('Erro ao buscar devices:', devicesError);
    throw devicesError;
  }

  // Buscar dispositivos móveis
  const { data: mobileDevices, error: mobileError } = await supabase
    .from('mobile_devices')
    .select('is_active, last_seen_at');

  if (mobileError) {
    logger.error('Erro ao buscar mobile devices:', mobileError);
  }

  // Buscar violações de hoje
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { count: alertsToday, error: alertsError } = await supabase
    .from('security_violations')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  if (alertsError) {
    logger.error('Erro ao buscar alertas:', alertsError);
  }

  // Calcular estatísticas
  const employeeDevices = (devices ?? []) as EmployeeDeviceStatsRow[];
  const mobileDeviceRows = (mobileDevices ?? []) as MobileDeviceStatsRow[];
  const desktops = employeeDevices.filter((d: EmployeeDeviceStatsRow) => d.device_type === 'desktop' || d.device_type === 'laptop').length;
  const mobiles = employeeDevices.filter((d: EmployeeDeviceStatsRow) => d.device_type === 'mobile').length + mobileDeviceRows.length;
  const totalDevices = desktops + mobiles;
  
  // Considerar online se visto nos últimos 5 minutos
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const onlineMobile = mobileDeviceRows.filter((d: MobileDeviceStatsRow) => 
    d.last_seen_at && new Date(d.last_seen_at as string) > fiveMinutesAgo
  ).length;
  
  // Para desktops, considerar is_active
  const onlineDesktop = employeeDevices.filter((d: EmployeeDeviceStatsRow) => d.is_active).length;
  const online = onlineDesktop + onlineMobile;

  return {
    totalDevices,
    desktops,
    mobiles,
    online,
    offline: totalDevices - online,
    blockedAttempts: 0, // Será implementado com rate_limit_logs
    alertsToday: alertsToday || 0
  };
}

export function useDeviceStats() {
  return useQuery({
    queryKey: ['device-stats'],
    queryFn: fetchDeviceStats,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
    staleTime: 10000, // Considerar stale após 10 segundos
  });
}
