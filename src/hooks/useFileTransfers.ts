import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Consulta e agregação de transferências de arquivo.
 *
 * Premissas explícitas (documentadas para auditoria):
 * - A tabela `file_transfers` é escrita exclusivamente pela Edge Function
 *   `ingest-file-transfer`; o front apenas lê e reclassifica.
 * - O RLS já restringe as linhas à empresa do usuário; os filtros abaixo são
 *   de usabilidade, nunca de segurança.
 * - `direction = 'out'` representa saída de dado do perímetro — é o vetor de
 *   risco relevante para exfiltração.
 */

export const TRANSFER_CHANNELS = [
  'usb',
  'browser_upload',
  'browser_download',
  'cloud_sync',
  'email_attach',
  'network_share',
  'print',
] as const;

export type TransferChannel = (typeof TRANSFER_CHANNELS)[number];
export type TransferVerdict = 'allowed' | 'blocked' | 'flagged';
export type TransferSensitivity =
  | 'unclassified'
  | 'public'
  | 'internal'
  | 'confidential'
  | 'restricted';

export const CHANNEL_LABELS: Record<TransferChannel, string> = {
  usb: 'USB',
  browser_upload: 'Upload no navegador',
  browser_download: 'Download no navegador',
  cloud_sync: 'Sincronização em nuvem',
  email_attach: 'Anexo de e-mail',
  network_share: 'Compartilhamento de rede',
  print: 'Impressão',
};

export const VERDICT_LABELS: Record<TransferVerdict, string> = {
  allowed: 'Permitida',
  blocked: 'Bloqueada',
  flagged: 'Sinalizada',
};

export const SENSITIVITY_LABELS: Record<TransferSensitivity, string> = {
  unclassified: 'Não classificado',
  public: 'Público',
  internal: 'Interno',
  confidential: 'Confidencial',
  restricted: 'Restrito',
};

export interface FileTransfer {
  id: string;
  company_id: string | null;
  employee_id: string | null;
  file_name: string;
  file_extension: string | null;
  file_size_bytes: number;
  file_hash: string | null;
  source_path: string | null;
  destination_path: string | null;
  channel: TransferChannel;
  direction: 'in' | 'out';
  application: string | null;
  process_name: string | null;
  destination_domain: string | null;
  removable_device_label: string | null;
  removable_device_serial: string | null;
  verdict: TransferVerdict;
  sensitivity: TransferSensitivity;
  dlp_policy_id: string | null;
  dlp_incident_id: string | null;
  violation_id: string | null;
  recording_session_id: string | null;
  metadata: Record<string, unknown> | null;
  occurred_at: string;
}

export interface FileTransferFilters {
  search: string;
  channel: TransferChannel | 'all';
  verdict: TransferVerdict | 'all';
  sensitivity: TransferSensitivity | 'all';
  /** Janela em dias a partir de agora. */
  days: number;
}

export const DEFAULT_FILTERS: FileTransferFilters = {
  search: '',
  channel: 'all',
  verdict: 'all',
  sensitivity: 'all',
  days: 7,
};

const MAX_ROWS = 1000;

export function useFileTransfers(filters: FileTransferFilters) {
  const since = useMemo(() => {
    const clamped = Number.isFinite(filters.days) && filters.days > 0 ? filters.days : 7;
    return new Date(Date.now() - clamped * 86400000).toISOString();
  }, [filters.days]);

  const query = useQuery({
    queryKey: ['file-transfers', filters.channel, filters.verdict, filters.sensitivity, since],
    staleTime: 30_000,
    queryFn: async (): Promise<FileTransfer[]> => {
      let builder = supabase
        .from('file_transfers')
        .select('*')
        .gte('occurred_at', since)
        .order('occurred_at', { ascending: false })
        .limit(MAX_ROWS);

      if (filters.channel !== 'all') builder = builder.eq('channel', filters.channel);
      if (filters.verdict !== 'all') builder = builder.eq('verdict', filters.verdict);
      if (filters.sensitivity !== 'all') builder = builder.eq('sensitivity', filters.sensitivity);

      const { data, error } = await builder;
      if (error) throw error;
      return (data ?? []) as unknown as FileTransfer[];
    },
  });

  /** Busca textual é local: evita ILIKE em coluna sem índice trigram. */
  const transfers = useMemo(() => {
    const rows = query.data ?? [];
    const term = filters.search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      [row.file_name, row.destination_domain, row.application, row.removable_device_label]
        .filter(Boolean)
        .some((value) => (value as string).toLowerCase().includes(term)),
    );
  }, [query.data, filters.search]);

  const stats = useMemo(() => {
    const outbound = transfers.filter((t) => t.direction === 'out');
    return {
      total: transfers.length,
      totalBytes: transfers.reduce((sum, t) => sum + Number(t.file_size_bytes ?? 0), 0),
      outboundBytes: outbound.reduce((sum, t) => sum + Number(t.file_size_bytes ?? 0), 0),
      blocked: transfers.filter((t) => t.verdict === 'blocked').length,
      flagged: transfers.filter((t) => t.verdict === 'flagged').length,
      sensitive: transfers.filter(
        (t) => t.sensitivity === 'confidential' || t.sensitivity === 'restricted',
      ).length,
      removableDevices: new Set(
        transfers
          .filter((t) => t.channel === 'usb')
          .map((t) => t.removable_device_serial ?? t.removable_device_label)
          .filter(Boolean),
      ).size,
    };
  }, [transfers]);

  /** Série diária por canal, para o gráfico de área empilhada. */
  const byChannelOverTime = useMemo(() => {
    const buckets = new Map<string, Record<string, number>>();
    for (const t of transfers) {
      const day = t.occurred_at.slice(0, 10);
      const bucket = buckets.get(day) ?? {};
      bucket[t.channel] = (bucket[t.channel] ?? 0) + 1;
      buckets.set(day, bucket);
    }
    return Array.from(buckets.entries())
      .map(([day, values]) => ({ day, ...values }))
      .sort((a, b) => a.day.localeCompare(b.day));
  }, [transfers]);

  /** Top colaboradores por volume de saída (bytes). */
  const topSenders = useMemo(() => {
    const acc = new Map<string, { label: string; bytes: number; events: number }>();
    for (const t of transfers) {
      if (t.direction !== 'out') continue;
      const label =
        (typeof t.metadata?.employee_name === 'string' ? t.metadata.employee_name : null) ??
        t.employee_id ??
        'Desconhecido';
      const current = acc.get(label) ?? { label, bytes: 0, events: 0 };
      current.bytes += Number(t.file_size_bytes ?? 0);
      current.events += 1;
      acc.set(label, current);
    }
    return Array.from(acc.values())
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 8);
  }, [transfers]);

  return {
    transfers,
    stats,
    byChannelOverTime,
    topSenders,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
