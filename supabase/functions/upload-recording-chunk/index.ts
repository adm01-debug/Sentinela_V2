import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit } from '../_shared/rateLimiting.ts';
import { Logger } from '../_shared/logger.ts';
import { validateInput, createValidationErrorResponse } from '../_shared/validation.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-agent-key',
};

const BUCKET = 'session-recordings';
/** 12 MB é o teto por trecho (60s de webm VP8 a ~1.5 Mbps com folga). */
const MAX_CHUNK_BYTES = 12 * 1024 * 1024;

const ChunkSchema = z.object({
  session_id: z.string().uuid().optional(),
  employee_name: z.string().min(1).max(200).optional(),
  device: z.string().max(200).optional(),
  reason: z.string().max(500).optional(),
  consent_acknowledged: z.boolean().optional(),
  sequence: z.number().int().min(0).max(100000),
  started_at: z.string().datetime(),
  duration_seconds: z.number().int().min(1).max(600).default(60),
  mime_type: z.string().max(100).default('video/webm'),
  app_name: z.string().max(200).optional(),
  window_title: z.string().max(500).optional(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/i).optional(),
  /** Conteúdo binário do trecho em base64. */
  chunk_base64: z.string().min(1),
  /** Marca o encerramento da sessão após gravar este trecho. */
  final: z.boolean().optional(),
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function decodeBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req) => {
  const logger = new Logger('upload-recording-chunk');

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  let agentKeyId: string | undefined;
  let companyId: string | undefined;
  let employeeId: string | undefined;

  try {
    // 1. Autenticação por chave de agente
    const agentKey = req.headers.get('x-agent-key');
    if (!agentKey) {
      await logger.log(supabase, { status: 401, method: req.method, error_message: 'Agent key required' });
      return json({ error: 'Agent key required', code: 'AUTH_REQUIRED' }, 401);
    }

    const { data: authData, error: authError } = await supabase
      .from('agent_keys')
      .select('id, company_id, employee_name, is_active')
      .eq('agent_key', agentKey)
      .eq('is_active', true)
      .maybeSingle();

    if (authError || !authData) {
      await logger.log(supabase, { status: 403, method: req.method, error_message: 'Invalid or inactive agent key' });
      return json({ error: 'Invalid or inactive agent key', code: 'AUTH_FAILED' }, 403);
    }

    agentKeyId = authData.id;
    companyId = authData.company_id ?? undefined;

    // 2. Rate limit (1 trecho/min esperado; 30/min cobre replay de fila offline)
    const rateLimit = await checkRateLimit(`agent:${agentKeyId}`, 'upload-recording-chunk', 30, 60);
    if (!rateLimit.allowed) {
      await logger.log(supabase, {
        status: 429, method: req.method, agent_key_id: agentKeyId, company_id: companyId,
        error_message: 'Rate limit exceeded',
      });
      return json({ error: 'Rate limit exceeded', retry_after: rateLimit.retryAfter }, 429);
    }

    // 3. Validação de entrada
    const validation = validateInput(ChunkSchema, await req.json());
    if (!validation.success) {
      await logger.log(supabase, {
        status: 422, method: req.method, agent_key_id: agentKeyId, company_id: companyId,
        error_message: validation.error, payload_summary: { issues: validation.details },
      });
      return createValidationErrorResponse(validation.error, validation.details, corsHeaders);
    }
    const payload = validation.data;

    // 4. Decodificação + verificação de integridade
    let bytes: Uint8Array;
    try {
      bytes = decodeBase64(payload.chunk_base64);
    } catch {
      await logger.log(supabase, {
        status: 422, method: req.method, agent_key_id: agentKeyId, company_id: companyId,
        error_message: 'chunk_base64 is not valid base64',
      });
      return json({ error: 'chunk_base64 inválido', code: 'INVALID_PAYLOAD' }, 422);
    }

    if (bytes.byteLength === 0 || bytes.byteLength > MAX_CHUNK_BYTES) {
      await logger.log(supabase, {
        status: 413, method: req.method, agent_key_id: agentKeyId, company_id: companyId,
        error_message: `Chunk size out of bounds: ${bytes.byteLength}`,
      });
      return json({ error: 'Tamanho de trecho inválido', max_bytes: MAX_CHUNK_BYTES }, 413);
    }

    const digest = await sha256Hex(bytes);
    if (payload.sha256 && payload.sha256.toLowerCase() !== digest) {
      await logger.log(supabase, {
        status: 422, method: req.method, agent_key_id: agentKeyId, company_id: companyId,
        error_message: 'Checksum mismatch',
      });
      return json({ error: 'Falha de integridade (sha256 divergente)', code: 'CHECKSUM_MISMATCH' }, 422);
    }

    // 5. Resolução do colaborador
    const employeeName = payload.employee_name || authData.employee_name || 'Desconhecido';
    if (authData.employee_name && companyId) {
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('name', authData.employee_name)
        .eq('company_id', companyId)
        .maybeSingle();
      employeeId = employee?.id;
    }

    // 6. Sessão: reutiliza a informada (validando posse) ou abre uma nova
    let sessionId = payload.session_id;
    if (sessionId) {
      const { data: existing } = await supabase
        .from('recording_sessions')
        .select('id, company_id, status')
        .eq('id', sessionId)
        .maybeSingle();

      if (!existing || (companyId && existing.company_id && existing.company_id !== companyId)) {
        await logger.log(supabase, {
          status: 404, method: req.method, agent_key_id: agentKeyId, company_id: companyId,
          error_message: 'Session not found for this agent',
        });
        return json({ error: 'Sessão de gravação não encontrada', code: 'SESSION_NOT_FOUND' }, 404);
      }
      if (existing.status !== 'recording') {
        await logger.log(supabase, {
          status: 409, method: req.method, agent_key_id: agentKeyId, company_id: companyId,
          error_message: `Session already ${existing.status}`,
        });
        return json({ error: 'Sessão já encerrada', status: existing.status }, 409);
      }
    } else {
      const retentionDays = await resolveRetentionDays(supabase, companyId);
      const { data: created, error: createError } = await supabase
        .from('recording_sessions')
        .insert({
          company_id: companyId,
          employee_id: employeeId,
          employee_name: employeeName,
          device: payload.device ?? agentKeyId,
          started_at: payload.started_at,
          status: 'recording',
          reason: payload.reason,
          consent_acknowledged: payload.consent_acknowledged ?? false,
          expires_at: new Date(Date.now() + retentionDays * 86400000).toISOString(),
        })
        .select('id')
        .single();

      if (createError || !created) throw new Error(`Falha ao criar sessão: ${createError?.message}`);
      sessionId = created.id;
    }

    // 7. Upload do binário (idempotente por caminho determinístico)
    const storagePath = `${companyId ?? 'sem-empresa'}/${sessionId}/${String(payload.sequence).padStart(6, '0')}.webm`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, bytes, { contentType: payload.mime_type, upsert: true });

    if (uploadError) throw new Error(`Falha no upload do trecho: ${uploadError.message}`);

    // 8. Metadados do trecho (duplicatas de replay são ignoradas silenciosamente)
    const { error: chunkError } = await supabase.from('recording_chunks').insert({
      session_id: sessionId,
      company_id: companyId,
      sequence: payload.sequence,
      started_at: payload.started_at,
      duration_seconds: payload.duration_seconds,
      storage_path: storagePath,
      mime_type: payload.mime_type,
      size_bytes: bytes.byteLength,
      sha256: digest,
      app_name: payload.app_name,
      window_title: payload.window_title,
    });

    const duplicated = chunkError?.code === '23505';
    if (chunkError && !duplicated) throw new Error(`Falha ao registrar trecho: ${chunkError.message}`);

    // 9. Agregados da sessão recalculados a partir dos trechos persistidos
    const { data: agg } = await supabase
      .from('recording_chunks')
      .select('duration_seconds, size_bytes')
      .eq('session_id', sessionId);

    const chunkCount = agg?.length ?? 0;
    const totalSeconds = (agg ?? []).reduce((sum, c) => sum + (c.duration_seconds ?? 0), 0);
    const totalBytes = (agg ?? []).reduce((sum, c) => sum + Number(c.size_bytes ?? 0), 0);

    await supabase
      .from('recording_sessions')
      .update({
        chunk_count: chunkCount,
        duration_seconds: totalSeconds,
        total_bytes: totalBytes,
        status: payload.final ? 'completed' : 'recording',
        ended_at: payload.final ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    await logger.log(supabase, {
      status: 200, method: req.method, agent_key_id: agentKeyId, company_id: companyId,
      employee_id: employeeId,
      payload_summary: { session_id: sessionId, sequence: payload.sequence, bytes: bytes.byteLength, duplicated },
    });

    return json({
      success: true,
      session_id: sessionId,
      sequence: payload.sequence,
      duplicated,
      sha256: digest,
      chunk_count: chunkCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    await logger.log(supabase, {
      status: 500, method: req.method, agent_key_id: agentKeyId, company_id: companyId,
      error_message: message,
    });
    return json({ error: 'Falha ao processar trecho de gravação', details: message }, 500);
  }
});

/** Busca a retenção específica da empresa e cai para a política global (padrão 30 dias). */
async function resolveRetentionDays(
  supabase: ReturnType<typeof createClient>,
  companyId?: string,
): Promise<number> {
  const { data } = await supabase
    .from('data_retention_policies')
    .select('company_id, retention_days')
    .eq('data_type', 'recordings')
    .eq('is_active', true);

  if (!data || data.length === 0) return 30;
  const scoped = data.find((p) => p.company_id === companyId);
  const global = data.find((p) => p.company_id === null);
  return Number(scoped?.retention_days ?? global?.retention_days ?? 30);
}
