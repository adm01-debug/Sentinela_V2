import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Custo e volume de armazenamento de gravações por empresa.
 *
 * Premissas explícitas (documentadas para auditoria):
 * - O rateio usa `total_bytes` agregado em `recording_sessions` (fonte de verdade
 *   recalculada pela Edge Function de ingestão a cada chunk).
 * - Sessões `expired` já tiveram os objetos removidos do bucket; elas entram em
 *   `reclaimedBytes` (economia obtida pela retenção), nunca no custo corrente.
 * - O custo é uma estimativa linear: GB armazenados x preço por GB/mês.
 */

const GB = 1024 ** 3;

export interface CompanyStorageUsage {
  companyId: string;
  companyName: string;
  sessions: number;
  activeBytes: number;
  reclaimedBytes: number;
  durationSeconds: number;
  monthlyCost: number;
  /** Participação percentual no custo total corrente. */
  share: number;
}

interface SessionRow {
  company_id: string | null;
  total_bytes: number | null;
  duration_seconds: number | null;
  status: string;
}

export function useRecordingStorageCost(pricePerGbMonth: number) {
  const query = useQuery({
    queryKey: ['recording-storage-cost'],
    staleTime: 60_000,
    queryFn: async (): Promise<{ rows: SessionRow[]; names: Map<string, string> }> => {
      const [sessions, companies] = await Promise.all([
        supabase
          .from('recording_sessions')
          .select('company_id, total_bytes, duration_seconds, status')
          .limit(5000),
        supabase.from('companies').select('id, name').limit(500),
      ]);

      if (sessions.error) throw sessions.error;
      if (companies.error) throw companies.error;

      const names = new Map<string, string>();
      (companies.data ?? []).forEach((c) => names.set(c.id, c.name ?? 'Sem nome'));

      return { rows: (sessions.data ?? []) as SessionRow[], names };
    },
  });

  const usage = useMemo<CompanyStorageUsage[]>(() => {
    const rows = query.data?.rows ?? [];
    const names = query.data?.names ?? new Map<string, string>();
    const price = Number.isFinite(pricePerGbMonth) && pricePerGbMonth > 0 ? pricePerGbMonth : 0;

    const acc = new Map<string, CompanyStorageUsage>();

    for (const row of rows) {
      const key = row.company_id ?? '__unassigned__';
      const current = acc.get(key) ?? {
        companyId: key,
        companyName: row.company_id ? (names.get(row.company_id) ?? 'Empresa removida') : 'Sem empresa',
        sessions: 0,
        activeBytes: 0,
        reclaimedBytes: 0,
        durationSeconds: 0,
        monthlyCost: 0,
        share: 0,
      };

      const bytes = Number(row.total_bytes ?? 0);
      current.sessions += 1;
      current.durationSeconds += Number(row.duration_seconds ?? 0);
      if (row.status === 'expired') current.reclaimedBytes += bytes;
      else current.activeBytes += bytes;

      acc.set(key, current);
    }

    const list = Array.from(acc.values()).map((item) => ({
      ...item,
      monthlyCost: (item.activeBytes / GB) * price,
    }));

    const totalCost = list.reduce((sum, item) => sum + item.monthlyCost, 0);
    return list
      .map((item) => ({ ...item, share: totalCost > 0 ? (item.monthlyCost / totalCost) * 100 : 0 }))
      .sort((a, b) => b.activeBytes - a.activeBytes);
  }, [query.data, pricePerGbMonth]);

  const totals = useMemo(() => {
    const activeBytes = usage.reduce((sum, u) => sum + u.activeBytes, 0);
    const reclaimedBytes = usage.reduce((sum, u) => sum + u.reclaimedBytes, 0);
    return {
      activeBytes,
      reclaimedBytes,
      activeGb: activeBytes / GB,
      monthlyCost: usage.reduce((sum, u) => sum + u.monthlyCost, 0),
      companies: usage.length,
      sessions: usage.reduce((sum, u) => sum + u.sessions, 0),
    };
  }, [usage]);

  return {
    usage,
    totals,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
