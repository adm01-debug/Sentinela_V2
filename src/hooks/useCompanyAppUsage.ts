import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAppCategories } from '@/hooks/useAppCategories';
import { format, subDays } from 'date-fns';

export interface AppUsage {
  app: string;
  duration: number;
}

interface RawAppEntry {
  app?: unknown;
  name?: unknown;
  identifier?: unknown;
  duration?: unknown;
  seconds?: unknown;
  time?: unknown;
}

function normalizeApps(raw: unknown): AppUsage[] {
  if (!Array.isArray(raw)) return [];
  const out: AppUsage[] = [];
  for (const item of raw as RawAppEntry[]) {
    if (!item || typeof item !== 'object') continue;
    const app = String(item.app ?? item.name ?? item.identifier ?? '').trim();
    const rawDur = item.duration ?? item.seconds ?? item.time ?? 0;
    const duration = typeof rawDur === 'number' ? rawDur : Number(rawDur) || 0;
    if (!app || duration <= 0) continue;
    out.push({ app, duration });
  }
  return out;
}

interface UseCompanyAppUsageOptions {
  employeeName?: string;
  device?: string;
}

/**
 * Agrega o uso de aplicações da empresa nos últimos `days` dias
 * a partir de `productivity_logs.apps_used`. Aceita filtros opcionais
 * por colaborador (nome exato) ou por dispositivo.
 */
export function useCompanyAppUsage(days: number = 7, options: UseCompanyAppUsageOptions = {}) {
  const { user } = useAuth();
  const { companyId } = useAppCategories();
  const { employeeName, device } = options;

  const startDate = format(subDays(new Date(), days - 1), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['company-app-usage', companyId, days, employeeName ?? null, device ?? null],
    enabled: !!user?.id,
    staleTime: 60_000,
    queryFn: async (): Promise<{ usage: AppUsage[]; idleSeconds: number }> => {
      let query = supabase
        .from('productivity_logs')
        .select('apps_used, neutral_time_seconds')
        .gte('recorded_date', startDate);

      if (employeeName) query = query.eq('employee_name', employeeName);
      if (device) query = query.eq('device', device);

      const { data, error } = await query;
      if (error) throw error;


      const totals = new Map<string, number>();
      let idleSeconds = 0;

      for (const row of data ?? []) {
        idleSeconds += Number((row as { neutral_time_seconds?: number }).neutral_time_seconds ?? 0);
        const apps = normalizeApps((row as { apps_used?: unknown }).apps_used);
        for (const a of apps) {
          totals.set(a.app, (totals.get(a.app) ?? 0) + a.duration);
        }
      }

      const usage = Array.from(totals.entries())
        .map(([app, duration]) => ({ app, duration }))
        .sort((a, b) => b.duration - a.duration);

      return { usage, idleSeconds };
    },
  });
}
