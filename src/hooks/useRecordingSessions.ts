import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Fase 1 — Gravação de sessão e playback histórico.
 *
 * Regras de projeto aplicadas:
 * - RLS por company_id no banco; aqui apenas consultamos.
 * - Bucket privado: URLs são assinadas sob demanda (TTL curto).
 * - Nenhum `any`; todos os contratos tipados explicitamente.
 */

export const RECORDINGS_BUCKET = 'session-recordings';

export type RecordingStatus = 'recording' | 'completed' | 'failed' | 'expired';

export interface RecordingSession {
  id: string;
  company_id: string | null;
  employee_id: string | null;
  employee_name: string;
  device: string | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
  total_bytes: number;
  chunk_count: number;
  status: RecordingStatus;
  reason: string | null;
  consent_acknowledged: boolean;
  expires_at: string | null;
  error_summary: string | null;
}

export interface RecordingChunk {
  id: string;
  session_id: string;
  sequence: number;
  started_at: string;
  duration_seconds: number;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  sha256: string | null;
  app_name: string | null;
  window_title: string | null;
}

export interface RecordingFilters {
  employeeName?: string;
  status?: RecordingStatus | 'all';
  startDate?: string;
  endDate?: string;
}

/** Lista de sessões gravadas, com filtros opcionais. */
export function useRecordingSessions(filters: RecordingFilters = {}) {
  const { employeeName, status, startDate, endDate } = filters;

  const query = useQuery({
    queryKey: ['recording-sessions', employeeName ?? '', status ?? 'all', startDate ?? '', endDate ?? ''],
    queryFn: async (): Promise<RecordingSession[]> => {
      let q = supabase
        .from('recording_sessions')
        .select(
          'id, company_id, employee_id, employee_name, device, started_at, ended_at, duration_seconds, total_bytes, chunk_count, status, reason, consent_acknowledged, expires_at, error_summary',
        )
        .order('started_at', { ascending: false })
        .limit(200);

      if (employeeName) q = q.ilike('employee_name', `%${employeeName}%`);
      if (status && status !== 'all') q = q.eq('status', status);
      if (startDate) q = q.gte('started_at', startDate);
      if (endDate) q = q.lte('started_at', endDate);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as RecordingSession[];
    },
    staleTime: 30_000,
  });

  const sessions = useMemo(() => query.data ?? [], [query.data]);

  const stats = useMemo(() => {
    const totalSeconds = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
    const totalBytes = sessions.reduce((sum, s) => sum + Number(s.total_bytes || 0), 0);
    return {
      total: sessions.length,
      recording: sessions.filter((s) => s.status === 'recording').length,
      failed: sessions.filter((s) => s.status === 'failed').length,
      totalSeconds,
      totalBytes,
    };
  }, [sessions]);

  return {
    sessions,
    stats,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Trechos (chunks) de uma sessão, já ordenados e com URL assinada. */
export interface PlayableChunk extends RecordingChunk {
  signedUrl: string | null;
  /** Offset acumulado em segundos desde o início da sessão. */
  offsetSeconds: number;
}

export function useRecordingChunks(sessionId: string | null) {
  const query = useQuery({
    queryKey: ['recording-chunks', sessionId],
    enabled: !!sessionId,
    staleTime: 4 * 60_000, // abaixo do TTL da URL assinada (10 min)
    queryFn: async (): Promise<PlayableChunk[]> => {
      const { data, error } = await supabase
        .from('recording_chunks')
        .select(
          'id, session_id, sequence, started_at, duration_seconds, storage_path, mime_type, size_bytes, sha256, app_name, window_title',
        )
        .eq('session_id', sessionId!)
        .order('sequence', { ascending: true });

      if (error) throw error;

      const chunks = (data ?? []) as RecordingChunk[];
      if (chunks.length === 0) return [];

      const paths = chunks.map((c) => c.storage_path);
      const { data: signed, error: signErr } = await supabase.storage
        .from(RECORDINGS_BUCKET)
        .createSignedUrls(paths, 600);

      if (signErr) throw signErr;

      const urlByPath = new Map<string, string | null>();
      (signed ?? []).forEach((entry, index) => {
        urlByPath.set(paths[index], entry.signedUrl ?? null);
      });

      let offset = 0;
      return chunks.map((chunk) => {
        const playable: PlayableChunk = {
          ...chunk,
          signedUrl: urlByPath.get(chunk.storage_path) ?? null,
          offsetSeconds: offset,
        };
        offset += chunk.duration_seconds || 0;
        return playable;
      });
    },
  });

  return {
    chunks: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Eventos correlacionados (violações e capturas com OCR) na janela da sessão. */
export interface RecordingTimelineEvent {
  id: string;
  kind: 'violation' | 'capture';
  label: string;
  detail: string | null;
  at: string;
  severity: string | null;
}

export function useRecordingTimeline(session: RecordingSession | null) {
  const query = useQuery({
    queryKey: ['recording-timeline', session?.id],
    enabled: !!session,
    staleTime: 60_000,
    queryFn: async (): Promise<RecordingTimelineEvent[]> => {
      if (!session) return [];
      const from = session.started_at;
      const to = session.ended_at ?? new Date().toISOString();

      const [violations, captures] = await Promise.all([
        supabase
          .from('security_violations')
          .select('id, violation_type, description, severity, created_at')
          .eq('employee_name', session.employee_name)
          .gte('created_at', from)
          .lte('created_at', to)
          .order('created_at', { ascending: true })
          .limit(200),
        supabase
          .from('screen_captures')
          .select('id, app_name, window_title, extracted_text, captured_at')
          .eq('employee_name', session.employee_name)
          .gte('captured_at', from)
          .lte('captured_at', to)
          .order('captured_at', { ascending: true })
          .limit(200),
      ]);

      if (violations.error) throw violations.error;
      if (captures.error) throw captures.error;

      const events: RecordingTimelineEvent[] = [
        ...(violations.data ?? []).map((v) => ({
          id: `violation-${v.id}`,
          kind: 'violation' as const,
          label: v.violation_type ?? 'Violação',
          detail: v.description ?? null,
          at: v.created_at,
          severity: v.severity ?? null,
        })),
        ...(captures.data ?? []).map((c) => ({
          id: `capture-${c.id}`,
          kind: 'capture' as const,
          label: c.app_name || c.window_title || 'Captura de tela',
          detail: c.extracted_text ?? null,
          at: c.captured_at,
          severity: null,
        })),
      ];

      return events.sort((a, b) => a.at.localeCompare(b.at));
    },
  });

  return {
    events: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
