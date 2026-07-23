import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { DisputeStatus } from './useViolationDisputes';

export const DISPUTE_SLA_HOURS = 72;

export interface DisputeMetrics {
  total: number;
  byStatus: Record<DisputeStatus, number>;
  byCategory: Record<string, number>;
  pending: number;
  resolvedWithinSla: number;
  resolvedBreachedSla: number;
  slaCompliancePct: number;
  avgResolutionHours: number | null;
  p90ResolutionHours: number | null;
  backlogAgeBuckets: { label: string; count: number }[];
  timeline: { date: string; created: number; resolved: number }[];
}

interface DisputeRow {
  id: string;
  status: DisputeStatus;
  category: string | null;
  created_at: string;
  resolved_at: string | null;
}

export const useDisputeMetrics = (params: { from: string; to: string }) => {
  return useQuery<DisputeMetrics>({
    queryKey: ['dispute-metrics', params.from, params.to],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('violation_disputes')
        .select('id, status, category, created_at, resolved_at')
        .gte('created_at', params.from)
        .lte('created_at', params.to)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return computeMetrics((data ?? []) as DisputeRow[]);
    },
    staleTime: 60_000,
  });
};

function computeMetrics(rows: DisputeRow[]): DisputeMetrics {
  const byStatus: Record<DisputeStatus, number> = {
    pending: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
    withdrawn: 0,
  };
  const byCategory: Record<string, number> = {};
  const resolutionsMs: number[] = [];
  const timelineMap = new Map<string, { created: number; resolved: number }>();
  const backlog = { '0-24h': 0, '24-72h': 0, '72h-7d': 0, '>7d': 0 };
  const now = Date.now();
  let resolvedWithinSla = 0;
  let resolvedBreachedSla = 0;

  for (const r of rows) {
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
    const cat = r.category ?? 'unspecified';
    byCategory[cat] = (byCategory[cat] ?? 0) + 1;

    const createdKey = r.created_at.slice(0, 10);
    const cell = timelineMap.get(createdKey) ?? { created: 0, resolved: 0 };
    cell.created += 1;
    timelineMap.set(createdKey, cell);

    if (r.resolved_at) {
      const ms = new Date(r.resolved_at).getTime() - new Date(r.created_at).getTime();
      resolutionsMs.push(ms);
      if (ms <= DISPUTE_SLA_HOURS * 3_600_000) resolvedWithinSla += 1;
      else resolvedBreachedSla += 1;

      const resKey = r.resolved_at.slice(0, 10);
      const rc = timelineMap.get(resKey) ?? { created: 0, resolved: 0 };
      rc.resolved += 1;
      timelineMap.set(resKey, rc);
    } else if (r.status === 'pending' || r.status === 'under_review') {
      const ageH = (now - new Date(r.created_at).getTime()) / 3_600_000;
      if (ageH < 24) backlog['0-24h'] += 1;
      else if (ageH < 72) backlog['24-72h'] += 1;
      else if (ageH < 168) backlog['72h-7d'] += 1;
      else backlog['>7d'] += 1;
    }
  }

  const totalResolved = resolvedWithinSla + resolvedBreachedSla;
  const avgResolutionHours =
    resolutionsMs.length > 0
      ? resolutionsMs.reduce((a, b) => a + b, 0) / resolutionsMs.length / 3_600_000
      : null;
  const sorted = [...resolutionsMs].sort((a, b) => a - b);
  const p90Idx = Math.floor(sorted.length * 0.9);
  const p90ResolutionHours = sorted.length > 0 ? sorted[Math.min(p90Idx, sorted.length - 1)] / 3_600_000 : null;

  return {
    total: rows.length,
    byStatus,
    byCategory,
    pending: byStatus.pending + byStatus.under_review,
    resolvedWithinSla,
    resolvedBreachedSla,
    slaCompliancePct: totalResolved > 0 ? Math.round((resolvedWithinSla / totalResolved) * 1000) / 10 : 0,
    avgResolutionHours,
    p90ResolutionHours,
    backlogAgeBuckets: Object.entries(backlog).map(([label, count]) => ({ label, count })),
    timeline: Array.from(timelineMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, ...v })),
  };
}
