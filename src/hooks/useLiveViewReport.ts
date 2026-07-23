import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LiveViewSessionRow {
  id: string;
  agent_id: string;
  agent_label: string;
  company_id: string;
  requested_by: string;
  viewer_label: string;
  status: string;
  consent_state: string;
  consent_reason: string | null;
  consent_decided_at: string | null;
  ip: string | null;
  user_agent: string | null;
  started_at: string | null;
  ended_at: string | null;
  end_reason: string | null;
  created_at: string;
  duration_seconds: number | null;
}

export interface LiveViewAuditRow {
  id: string;
  session_id: string;
  event: string;
  payload: Record<string, unknown> | null;
  created_at: string;
}

export interface LiveViewReport {
  sessions: LiveViewSessionRow[];
  audit: LiveViewAuditRow[];
}

export interface LiveViewReportFilters {
  from: string; // ISO
  to: string;   // ISO
  agentId?: string | null;
}

export function useLiveViewReport(filters: LiveViewReportFilters) {
  return useQuery<LiveViewReport>({
    queryKey: ['live-view-report', filters.from, filters.to, filters.agentId ?? 'all'],
    queryFn: async () => {
      let q = supabase
        .from('live_view_sessions')
        .select('id, agent_id, company_id, requested_by, status, consent_state, consent_reason, consent_decided_at, ip, user_agent, started_at, ended_at, end_reason, created_at')
        .gte('created_at', filters.from)
        .lte('created_at', filters.to)
        .order('created_at', { ascending: false })
        .limit(1000);
      if (filters.agentId) q = q.eq('agent_id', filters.agentId);
      const { data: sessions, error } = await q;
      if (error) throw error;

      const sessionIds = (sessions ?? []).map((s) => s.id);
      const agentIds = Array.from(new Set((sessions ?? []).map((s) => s.agent_id)));
      const viewerIds = Array.from(new Set((sessions ?? []).map((s) => s.requested_by)));

      const [agentsRes, viewersRes, auditRes] = await Promise.all([
        agentIds.length
          ? supabase.from('agent_keys').select('id, key_name, employee_name').in('id', agentIds)
          : Promise.resolve({ data: [], error: null } as const),
        viewerIds.length
          ? supabase.from('profiles').select('id, full_name, email').in('id', viewerIds)
          : Promise.resolve({ data: [], error: null } as const),
        sessionIds.length
          ? supabase
              .from('live_view_audit')
              .select('id, session_id, event, payload, created_at')
              .in('session_id', sessionIds)
              .order('created_at', { ascending: true })
          : Promise.resolve({ data: [], error: null } as const),
      ]);

      const agentMap = new Map<string, string>();
      (agentsRes.data ?? []).forEach((a) => {
        agentMap.set(a.id, a.employee_name || a.key_name || a.id.slice(0, 8));
      });
      const viewerMap = new Map<string, string>();
      (viewersRes.data ?? []).forEach((v) => {
        viewerMap.set(v.id, v.full_name || v.email || v.id.slice(0, 8));
      });

      const rows: LiveViewSessionRow[] = (sessions ?? []).map((s) => {
        const duration =
          s.started_at && s.ended_at
            ? Math.max(0, Math.round((new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 1000))
            : null;
        return {
          ...s,
          agent_label: agentMap.get(s.agent_id) ?? s.agent_id.slice(0, 8),
          viewer_label: viewerMap.get(s.requested_by) ?? s.requested_by.slice(0, 8),
          duration_seconds: duration,
        };
      });

      return {
        sessions: rows,
        audit: (auditRes.data ?? []) as LiveViewAuditRow[],
      };
    },
    staleTime: 30_000,
  });
}

export function formatDuration(seconds: number | null): string {
  if (seconds == null) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s.toString().padStart(2, '0')}s` : `${s}s`;
}
