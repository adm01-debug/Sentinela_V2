import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Logger } from '../_shared/logger.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BUCKET = 'session-recordings';
/** Sessões sem trechos novos por mais de 15 min são consideradas interrompidas. */
const STALE_MINUTES = 15;
const MAX_SESSIONS_PER_RUN = 200;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  const logger = new Logger('expire-recordings');
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    const nowIso = new Date().toISOString();

    // 1. Fecha sessões órfãs (agente caiu sem enviar o trecho final)
    const staleCutoff = new Date(Date.now() - STALE_MINUTES * 60_000).toISOString();
    const { data: stale } = await supabase
      .from('recording_sessions')
      .select('id')
      .eq('status', 'recording')
      .lt('updated_at', staleCutoff)
      .limit(MAX_SESSIONS_PER_RUN);

    let closedStale = 0;
    if (stale && stale.length > 0) {
      const { error } = await supabase
        .from('recording_sessions')
        .update({
          status: 'failed',
          ended_at: nowIso,
          error_summary: `Sessão sem trechos novos por mais de ${STALE_MINUTES} minutos`,
          updated_at: nowIso,
        })
        .in('id', stale.map((s) => s.id));
      if (error) throw new Error(`Falha ao encerrar sessões órfãs: ${error.message}`);
      closedStale = stale.length;
    }

    // 2. Expira sessões que passaram da retenção e apaga os binários
    const { data: expired } = await supabase
      .from('recording_sessions')
      .select('id')
      .neq('status', 'expired')
      .not('expires_at', 'is', null)
      .lt('expires_at', nowIso)
      .limit(MAX_SESSIONS_PER_RUN);

    let expiredSessions = 0;
    let removedObjects = 0;

    for (const session of expired ?? []) {
      const { data: chunks } = await supabase
        .from('recording_chunks')
        .select('id, storage_path')
        .eq('session_id', session.id);

      const paths = (chunks ?? []).map((c) => c.storage_path).filter(Boolean);
      if (paths.length > 0) {
        // Remove em lotes de 100 para não estourar o limite da API de storage
        for (let i = 0; i < paths.length; i += 100) {
          const batch = paths.slice(i, i + 100);
          const { error: removeError } = await supabase.storage.from(BUCKET).remove(batch);
          if (removeError) {
            console.error(`Falha ao remover objetos da sessão ${session.id}: ${removeError.message}`);
            continue;
          }
          removedObjects += batch.length;
        }
        await supabase.from('recording_chunks').delete().eq('session_id', session.id);
      }

      await supabase
        .from('recording_sessions')
        .update({
          status: 'expired',
          total_bytes: 0,
          chunk_count: 0,
          ended_at: nowIso,
          updated_at: nowIso,
          error_summary: 'Vídeos removidos por política de retenção (metadados preservados para auditoria)',
        })
        .eq('id', session.id);

      expiredSessions++;
    }

    // 3. Aplica a retenção de transferências de arquivo (por empresa, com padrão global)
    //    Premissa: `data_retention_policies.company_id IS NULL` representa a política global;
    //    uma política específica de empresa sempre prevalece sobre ela.
    const { data: ftPolicies } = await supabase
      .from('data_retention_policies')
      .select('company_id, retention_days')
      .eq('data_type', 'file_transfers')
      .eq('is_active', true);

    const globalDays =
      ftPolicies?.find((p) => p.company_id === null)?.retention_days ?? DEFAULT_FILE_TRANSFER_DAYS;
    const perCompany = (ftPolicies ?? []).filter((p) => p.company_id !== null);

    let purgedFileTransfers = 0;

    for (const policy of perCompany) {
      const cutoff = new Date(Date.now() - policy.retention_days * 86_400_000).toISOString();
      const { data: removed, error } = await supabase
        .from('file_transfers')
        .delete()
        .eq('company_id', policy.company_id)
        .lt('occurred_at', cutoff)
        .select('id');
      if (error) {
        console.error(`Falha ao expurgar file_transfers da empresa ${policy.company_id}: ${error.message}`);
        continue;
      }
      purgedFileTransfers += removed?.length ?? 0;
    }

    // Empresas sem política própria caem no padrão global.
    const globalCutoff = new Date(Date.now() - globalDays * 86_400_000).toISOString();
    let globalQuery = supabase
      .from('file_transfers')
      .delete()
      .lt('occurred_at', globalCutoff);
    const excluded = perCompany.map((p) => p.company_id as string);
    if (excluded.length > 0) {
      globalQuery = globalQuery.or(
        `company_id.is.null,company_id.not.in.(${excluded.join(',')})`,
      );
    }
    const { data: globalRemoved, error: globalError } = await globalQuery.select('id');
    if (globalError) {
      console.error(`Falha no expurgo global de file_transfers: ${globalError.message}`);
    } else {
      purgedFileTransfers += globalRemoved?.length ?? 0;
    }

    const summary = {
      closed_stale: closedStale,
      expired_sessions: expiredSessions,
      removed_objects: removedObjects,
      purged_file_transfers: purgedFileTransfers,
    };
    await logger.log(supabase, { status: 200, method: req.method, payload_summary: summary });
    return json({ success: true, ...summary, executed_at: nowIso });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    await logger.log(supabase, { status: 500, method: req.method, error_message: message });
    return json({ error: 'Falha na rotina de retenção de gravações', details: message }, 500);
  }
});
