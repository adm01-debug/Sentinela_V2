import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Activity } from '@/types';

const toSafeTimestamp = (value: string | null | undefined): string => {
  if (!value) return new Date(0).toISOString();
  return Number.isNaN(Date.parse(value)) ? new Date(0).toISOString() : value;
};

const mapKeystrokeToActivity = (row: any): Activity => {
  const activeSeconds = Number(row?.active_time_seconds ?? 0);
  const idleSeconds = Number(row?.idle_time_seconds ?? 0);

  return {
    id: row?.id,
    employeeId: row?.employee_name ?? 'unknown',
    type: 'application',
    application: row?.app_name ?? 'Unknown app',
    title: row?.app_name ?? 'Sem título',
    productive: activeSeconds >= idleSeconds,
    duration: activeSeconds,
    keystrokes: Number(row?.keystrokes_count ?? 0),
    timestamp: toSafeTimestamp(row?.recorded_at ?? row?.created_at),
    metadata: {
      device: row?.device ?? null,
      idleSeconds,
    },
  };
};

export const useActivities = (filters?: any) => {
  return useQuery({
    queryKey: ['activities', filters],
    queryFn: async () => {
      let query = supabase
        .from('keystroke_logs')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(100);

      if (filters?.employee_name) query = query.eq('employee_name', filters.employee_name);
      if (filters?.startDate) query = query.gte('recorded_at', `${filters.startDate}T00:00:00`);
      if (filters?.endDate) query = query.lte('recorded_at', `${filters.endDate}T23:59:59`);

      const { data, error } = await query;
      if (error) throw error;

      const mapped = (data || []).map(mapKeystrokeToActivity);
      return { data: mapped, total: mapped.length };
    },
  });
};

export const useActivity = (id: string) => {
  return useQuery({
    queryKey: ['activity', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('keystroke_logs').select('*').eq('id', id).single();
      if (error) throw error;
      return data ? mapKeystrokeToActivity(data) : null;
    },
    enabled: !!id,
  });
};

export const useActivitySummary = (filters?: any) => {
  return useQuery({
    queryKey: ['activity-summary', filters],
    queryFn: async () => ({
      totalKeystrokes: 0,
      totalActiveTime: 0,
      totalIdleTime: 0,
      topApps: [] as any[],
    }),
  });
};
