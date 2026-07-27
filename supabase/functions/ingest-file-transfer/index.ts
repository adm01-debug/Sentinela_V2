import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit } from '../_shared/rateLimiting.ts';
import { Logger } from '../_shared/logger.ts';
import { validateInput, createValidationErrorResponse } from '../_shared/validation.ts';

/**
 * Ingestão de eventos de transferência de arquivo emitidos pelo agente desktop.
 *
 * Premissas explícitas:
 * - Autenticação é por `x-agent-key` (mesmo contrato de `upload-recording-chunk`).
 * - O agente pode enviar em lote (até 100 eventos) para tolerar fila offline.
 * - A avaliação DLP é feita no servidor: o veredito do agente é uma sugestão,
 *   mas a política ativa da empresa tem precedência (defesa em profundidade).
 * - Deduplicação é garantida pelo índice único (employee_id, file_hash, channel,
 *   occurred_at); conflitos são tratados como sucesso idempotente.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-agent-key',
};

const CHANNELS = [
  'usb',
  'browser_upload',
  'browser_download',
  'cloud_sync',
  'email_attach',
  'network_share',
  'print',
] as const;

/** Escopos de política DLP que se aplicam a movimentação de arquivos. */
const FILE_SCOPES = new Set(['file', 'upload', 'usb', 'file_transfer', 'print', 'email']);

const TransferSchema = z.object({
  file_name: z.string().trim().min(1).max(400),
  file_extension: z.string().trim().max(20).optional(),
  file_size_bytes: z.number().int().min(0).max(1_099_511_627_776).default(0),
  file_hash: z
    .string()
    .regex(/^[a-f0-9]{64}$/i, 'file_hash deve ser SHA-256 hexadecimal')
    .optional(),
  source_path: z.string().max(1000).optional(),
  destination_path: z.string().max(1000).optional(),
  channel: z.enum(CHANNELS),
  direction: z.enum(['in', 'out']).default('out'),
  application: z.string().max(200).optional(),
  process_name: z.string().max(200).optional(),
  destination_domain: z.string().max(255).optional(),
  removable_device_label: z.string().max(200).optional(),
  removable_device_serial: z.string().max(200).optional(),
  sensitivity: z
    .enum(['unclassified', 'public', 'internal', 'confidential', 'restricted'])
    .default('unclassified'),
  /** Veredito aplicado localmente pelo agente (pode ser sobrescrito pelo servidor). */
  verdict: z.enum(['allowed', 'blocked', 'flagged']).default('allowed'),
  occurred_at: z.string().datetime(),
  recording_session_id: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const BodySchema = z.object({
  device: z.string().max(200).optional(),
  employee_name: z.string().max(200).optional(),
  events: z.array(TransferSchema).min(1).max(100),
});

type TransferInput = z.infer<typeof TransferSchema>;

interface DlpPolicyRow {
  id: string;
  name: string;
  keywords: string[] | null;
  custom_pattern: string | null;
  severity: string;
  action: string;
  scope: string[];
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function normalizeExtension(input: TransferInput): string | null {
  if (input.file_extension) return input.file_extension.replace(/^\./, '').toLowerCase();
  const match = input.file_name.match(/\.([A-Za-z0-9]{1,12})$/);
  return match ? match[1].toLowerCase() : null;
}

/** Texto avaliado pelas regras: nome do arquivo + caminhos + destino. */
function haystack(input: TransferInput): string {
  return [input.file_name, input.source_path, input.destination_path, input.destination_domain]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function matchPolicy(input: TransferInput, policies: DlpPolicyRow[]): DlpPolicyRow | null {
  const text = haystack(input);
  for (const policy of policies) {
    const scoped = (policy.scope ?? []).some((s) => FILE_SCOPES.has(s));
    if (!scoped) continue;

    const keywordHit = (policy.keywords ?? []).some(
      (kw) => kw.trim().length > 0 && text.includes(kw.trim().toLowerCase()),
    );
    let patternHit = false;
    if (!keywordHit && policy.custom_pattern) {
      try {
        patternHit = new RegExp(policy.custom_pattern, 'i').test(text);
      } catch {
        // Padrão inválido cadastrado pelo usuário: ignora sem derrubar a ingestão.
        patternHit = false;
      }
    }
    if (keywordHit || patternHit) return policy;
  }
  return null;
}

serve(async (req) => {
  const logger = new Logger('ingest-file-transfer');

  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  let agentKeyId: string | undefined;
  let companyId: string | undefined;

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

    // 2. Rate limit — 60 lotes/min cobre replay de fila offline sem abrir DoS
    const rateLimit = await checkRateLimit(`agent:${agentKeyId}`, 'ingest-file-transfer', 60, 60);
    if (!rateLimit.allowed) {
      await logger.log(supabase, {
        status: 429, method: req.method, agent_key_id: agentKeyId, company_id: companyId,
        error_message: 'Rate limit exceeded',
      });
      return json({ error: 'Rate limit exceeded', retry_after: rateLimit.retryAfter }, 429);
    }

    // 3. Validação de entrada
    const validation = validateInput(BodySchema, await req.json());
    if (!validation.success) {
      await logger.log(supabase, {
        status: 422, method: req.method, agent_key_id: agentKeyId, company_id: companyId,
        error_message: validation.error, payload_summary: { issues: validation.details },
      });
      return createValidationErrorResponse(validation.error, validation.details, corsHeaders);
    }
    const body = validation.data;

    // 4. Resolução do colaborador e do dispositivo
    const employeeName = body.employee_name || authData.employee_name || 'Desconhecido';
    let employeeId: string | null = null;
    if (authData.employee_name && companyId) {
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('name', authData.employee_name)
        .eq('company_id', companyId)
        .maybeSingle();
      employeeId = employee?.id ?? null;
    }

    // 5. Políticas DLP ativas da empresa (avaliadas em memória, uma leitura por lote)
    let policies: DlpPolicyRow[] = [];
    if (companyId) {
      const { data } = await supabase
        .from('dlp_policies')
        .select('id, name, keywords, custom_pattern, severity, action, scope')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .limit(200);
      policies = (data ?? []) as DlpPolicyRow[];
    }

    // 6. Persistência evento a evento (idempotente por índice único)
    let inserted = 0;
    let duplicated = 0;
    let blocked = 0;
    const incidents: string[] = [];

    for (const event of body.events) {
      const policy = matchPolicy(event, policies);
      let verdict = event.verdict;
      let incidentId: string | null = null;

      if (policy) {
        if (policy.action === 'block') verdict = 'blocked';
        else if (verdict === 'allowed') verdict = 'flagged';

        const { data: incident } = await supabase
          .from('dlp_incidents')
          .insert({
            company_id: companyId,
            policy_id: policy.id,
            source_type: event.channel === 'email_attach' ? 'email' : 'file',
            action_taken: policy.action,
            severity: policy.severity,
            employee_name: employeeName,
            device_name: body.device ?? null,
            agent_key_id: agentKeyId,
            app_name: event.application ?? event.process_name ?? null,
            match_summary: `Transferência de arquivo "${event.file_name}" via ${event.channel}`,
            metadata: {
              channel: event.channel,
              direction: event.direction,
              destination_domain: event.destination_domain ?? null,
              policy_name: policy.name,
            },
            detected_at: event.occurred_at,
          })
          .select('id')
          .maybeSingle();
        incidentId = incident?.id ?? null;
        if (incidentId) incidents.push(incidentId);
      }

      if (verdict === 'blocked') blocked += 1;

      const { error: insertError } = await supabase.from('file_transfers').insert({
        company_id: companyId ?? null,
        employee_id: employeeId,
        file_name: event.file_name,
        file_extension: normalizeExtension(event),
        file_size_bytes: event.file_size_bytes,
        file_hash: event.file_hash?.toLowerCase() ?? null,
        source_path: event.source_path ?? null,
        destination_path: event.destination_path ?? null,
        channel: event.channel,
        direction: event.direction,
        application: event.application ?? null,
        process_name: event.process_name ?? null,
        destination_domain: event.destination_domain ?? null,
        removable_device_label: event.removable_device_label ?? null,
        removable_device_serial: event.removable_device_serial ?? null,
        verdict,
        sensitivity: event.sensitivity,
        dlp_policy_id: policy?.id ?? null,
        dlp_incident_id: incidentId,
        recording_session_id: event.recording_session_id ?? null,
        metadata: { ...(event.metadata ?? {}), device: body.device ?? null, employee_name: employeeName },
        occurred_at: event.occurred_at,
      });

      if (insertError) {
        // 23505 = violação de unicidade → evento já ingerido, resposta idempotente.
        if (insertError.code === '23505') {
          duplicated += 1;
          continue;
        }
        throw new Error(`Falha ao gravar transferência: ${insertError.message}`);
      }
      inserted += 1;
    }

    await logger.log(supabase, {
      status: 200, method: req.method, agent_key_id: agentKeyId, company_id: companyId,
      payload_summary: { received: body.events.length, inserted, duplicated, blocked },
    });

    return json({ received: body.events.length, inserted, duplicated, blocked, incidents });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('ingest-file-transfer failed:', message);
    await logger.log(supabase, {
      status: 500, method: req.method, agent_key_id: agentKeyId, company_id: companyId,
      error_message: message,
    });
    return json({ error: 'Falha ao processar transferências', details: message }, 500);
  }
});
