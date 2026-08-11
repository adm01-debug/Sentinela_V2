// Seed: Integrations Health — Slack, WhatsApp, FCM/Push
const SUPABASE_URL = 'https://jgnmwvzephsozsqmcpzb.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnbm13dnplcGhzb3pzcW1jcHpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTE2MDQzNiwiZXhwIjoyMTAwNzM2NDM2fQ.Y4xu0BUNeQiCrP3zva8KmnxDhXYaVMU-R9qHdVavCxQ';
const H = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const COMPANY_ID = 'c0000000-0000-0000-0000-000000000001';
const USER_ID = 'b7ce87c2-ba3c-42b4-9105-9579dccdfa3a';

const uuid = () => crypto.randomUUID();
const now = Date.now();
const agoH = (h) => new Date(now - h * 3_600_000).toISOString();
const agoMin = (m) => new Date(now - m * 60_000).toISOString();

async function post(path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'POST',
    headers: { ...H, 'Prefer': 'return=representation' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}
async function upsert(path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'POST',
    headers: { ...H, 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

// ── Slack Delivery Events (7 days) ────────────────────────────────────────────
function buildSlackDeliveryEvents(integrationId, integrationName) {
  const events = [];
  for (let h = 0; h < 24 * 7; h++) {
    const r = Math.random();
    const success = r > 0.04; // 96% success rate
    const hourAgo = h + Math.random();
    events.push({
      id: uuid(),
      integration_id: integrationId,
      company_id: COMPANY_ID,
      event_type: integrationName.includes('Crítica') ? 'critical_escalation' : 'violation_created',
      severity: 'high',
      success,
      status_code: success ? 200 : 503,
      attempts: 1,
      duration_ms: Math.floor(Math.random() * 400) + 80,
      error_message: success ? null : 'webhook_timeout',
      created_at: agoH(hourAgo),
    });
  }
  return events;
}

// ── Slack DLQ ─────────────────────────────────────────────────────────────────
const DLQ_REASONS = [
  { reason: 'timeout', permanent: false },
  { reason: 'channel_not_found', permanent: true },
  { reason: 'rate_limit', permanent: false },
  { reason: 'invalid_payload', permanent: true },
  { reason: 'webhook_timeout', permanent: false },
];

// ── WhatsApp Notification Settings ──────────────────────────────────────────
const WHATSAPP_SETTINGS = {
  id: uuid(),
  enabled: true,
  phone_number_id: 'whatsapp-business-11999999000',
  recipient_numbers: ['11999998888', '11999998777', '21988887777'],
  notify_critical: true,
  notify_high: true,
  notify_medium: true,
  notify_low: false,
  created_by: USER_ID,
  created_at: agoH(480),
  updated_at: agoH(24),
};

// ── WhatsApp Message Logs (last 48h) ─────────────────────────────────────────
function buildWhatsAppLogs() {
  const logs = [];
  const statuses = [
    { status: 'delivered', weight: 0.65 },
    { status: 'sent', weight: 0.20 },
    { status: 'failed', weight: 0.10 },
    { status: 'pending', weight: 0.05 },
  ];
  const numbers = ['11999998888', '11999998777', '21988887777'];
  const contents = [
    'Nova violacao detectada: acesso fora do horario permittedido.',
    'SLA de disputa proximo do prazo: 30min restantes.',
    'Escalacao critica acionada para a gerencia.',
    'Bloqueio automatico ativado para colaborador.',
    'Alerta de hora extra: limite Diario atingido.',
  ];

  for (let i = 0; i < 80; i++) {
    const r = Math.random();
    let cumulative = 0;
    let status = 'sent';
    for (const s of statuses) {
      cumulative += s.weight;
      if (r < cumulative) { status = s.status; break; }
    }
    const minutesAgo = Math.floor(Math.random() * 60 * 48);
    logs.push({
      id: uuid(),
      recipient_number: numbers[i % numbers.length],
      message_type: 'alert',
      message_content: contents[i % contents.length],
      status,
      whatsapp_message_id: status === 'delivered' ? `wamid.${Date.now()}${i}` : null,
      error_message: status === 'failed' ? 'whatsapp_api_timeout' : null,
      violation_id: null,
      created_at: agoMin(minutesAgo),
    });
  }
  return logs;
}

// ── Mobile Devices ────────────────────────────────────────────────────────────
const DEV_ID_1 = 'a5455150-8d4e-4cfd-85cb-701dc0086101';
const DEV_ID_2 = 'a5455150-8d4e-4cfd-85cb-701dc0086102';
const DEV_ID_3 = 'a5455150-8d4e-4cfd-85cb-701dc0086103';

const MOBILE_DEVICES = [
  {
    id: DEV_ID_1,
    employee_name: 'Carlos Silva',
    device_id: 'APA91bHPRD45K-test-device-carlos',
    device_model: 'Samsung Galaxy S24',
    os_type: 'android',
    os_version: '14',
    app_version: '2.1.4',
    push_token: 'fcm_token_carlos_silva_abc123xyz',
    last_location_lat: -23.5505,
    last_location_lng: -46.6333,
    last_seen_at: agoMin(10),
    is_active: true,
    created_at: agoH(720),
    updated_at: agoMin(10),
  },
  {
    id: DEV_ID_2,
    employee_name: 'Ana Oliveira',
    device_id: 'APA91bHPRD45K-test-device-ana',
    device_model: 'iPhone 15 Pro',
    os_type: 'ios',
    os_version: '17.4',
    app_version: '2.1.4',
    push_token: 'fcm_token_ana_oliveira_def456uvw',
    last_location_lat: -23.5612,
    last_location_lng: -46.6541,
    last_seen_at: agoMin(30),
    is_active: true,
    created_at: agoH(360),
    updated_at: agoMin(30),
  },
  {
    id: DEV_ID_3,
    employee_name: 'Pedro Santos',
    device_id: 'APA91bHPRD45K-test-device-pedro',
    device_model: 'Xiaomi Redmi Note 13',
    os_type: 'android',
    os_version: '13',
    app_version: '2.1.3',
    push_token: null,
    last_location_lat: null,
    last_location_lng: null,
    last_seen_at: agoH(24),
    is_active: true,
    created_at: agoH(168),
    updated_at: agoH(24),
  },
];

// ── FCM Edge Function Logs (for FCM health) ──────────────────────────────────
function buildFcmLogs() {
  const logs = [];
  for (let i = 0; i < 60; i++) {
    const r = Math.random();
    const ok = r > 0.03;
    logs.push({
      function_name: ['send-push-notification', 'notify-mobile-violation'][i % 2],
      request_id: uuid(),
      company_id: COMPANY_ID,
      method: 'POST',
      status: ok ? 200 : 503,
      duration_ms: Math.floor(Math.random() * 300) + 50,
      error_message: ok ? null : 'fcm_server_unavailable',
      payload_summary: { tokens_sent: ok ? 3 : 0, reason: ok ? null : 'provider_error' },
      created_at: agoMin(i * 20 + 5),
    });
  }
  return logs;
}

// ── Run ───────────────────────────────────────────────────────────────────────
(async () => {
  // Fixed UUIDs so upsert merges instead of re-inserting on each run
  const INT_ID_1 = 'b5455150-8d4e-4cfd-85cb-701dc0086136';
  const INT_ID_2 = 'c5455150-8d4e-4cfd-85cb-701dc0086137';
  const INT_ID_3 = 'd5455150-8d4e-4cfd-85cb-701dc0086138';

  // Slack Integrations (upsert by id)
  const SLACK_INTEGRATIONS = [
    {
      id: INT_ID_1,
      name: 'Alertas Operacionais',
      webhook_url: 'https://hooks.slack.com/services/T00000001/B00000001/XXXXXXXXXXXXXXXXXXXX',
      event_types: ['violation_created', 'sla_breach'],
      min_severity: 'warning',
      is_active: true,
      last_success_at: agoMin(15),
      last_error: null,
      last_error_at: agoH(4),
      failure_count: 0,
      created_by: USER_ID,
      created_at: agoH(720),
      updated_at: agoMin(15),
      auto_pause_threshold: 5,
      auto_paused_at: null,
      auto_pause_reason: null,
      company_id: COMPANY_ID,
    },
    {
      id: INT_ID_2,
      name: 'Escalação Crítica',
      webhook_url: 'https://hooks.slack.com/services/T00000002/B00000002/YYYYYYYYYYYYYYYYYYYYYY',
      event_types: ['critical_escalation', 'dispute_escalated'],
      min_severity: 'critical',
      is_active: true,
      last_success_at: agoH(2),
      last_error: 'channel_not_found',
      last_error_at: agoH(6),
      failure_count: 1,
      created_by: USER_ID,
      created_at: agoH(480),
      updated_at: agoH(2),
      auto_pause_threshold: 3,
      auto_paused_at: null,
      auto_pause_reason: null,
      company_id: COMPANY_ID,
    },
    {
      id: INT_ID_3,
      name: 'Monitoramento SLA',
      webhook_url: 'https://hooks.slack.com/services/T00000003/B00000003/ZZZZZZZZZZZZZZZZZZZZZZZZZ',
      event_types: ['sla_warning', 'sla_breach', 'sla_recovered'],
      min_severity: 'warning',
      is_active: true,
      last_success_at: agoH(1),
      last_error: null,
      last_error_at: agoH(48),
      failure_count: 0,
      created_by: USER_ID,
      created_at: agoH(360),
      updated_at: agoH(1),
      auto_pause_threshold: 5,
      auto_paused_at: null,
      auto_pause_reason: null,
      company_id: COMPANY_ID,
    },
  ];

  // Slack Integrations (upsert)
  const slackInt = await upsert('slack_integrations', SLACK_INTEGRATIONS);
  console.log(`Upserted ${slackInt.length} slack_integrations`);

  // Slack Delivery Events
  // Slack Delivery Events — clear old test data, then insert fresh
  await fetch(`${SUPABASE_URL}/rest/v1/slack_delivery_events?integration_id=eq.${INT_ID_1}`, { method: 'DELETE', headers: H });
  await fetch(`${SUPABASE_URL}/rest/v1/slack_delivery_events?integration_id=eq.${INT_ID_2}`, { method: 'DELETE', headers: H });
  await fetch(`${SUPABASE_URL}/rest/v1/slack_delivery_events?integration_id=eq.${INT_ID_3}`, { method: 'DELETE', headers: H });
  const allDeliveryEvents = [
    ...buildSlackDeliveryEvents(INT_ID_1, 'Alertas Operacionais'),
    ...buildSlackDeliveryEvents(INT_ID_2, 'Escalacao Critica'),
    ...buildSlackDeliveryEvents(INT_ID_3, 'Monitoramento SLA'),
  ];
  // Insert delivery events (may have old ones — use post which appends)
  if (allDeliveryEvents.length > 0) {
    const delivery = await post('slack_delivery_events', allDeliveryEvents);
    console.log(`Inserted ${delivery.length} slack_delivery_events`);
  }

  // Slack DLQ
  const dlqEntries = [];
  for (let i = 0; i < 5; i++) {
    const r = DLQ_REASONS[i % DLQ_REASONS.length];
    dlqEntries.push({
      id: uuid(),
      integration_id: [INT_ID_1, INT_ID_2, INT_ID_3][i % 3],
      event_type: ['violation_created', 'sla_breach', 'dispute_escalated'][i % 3],
      severity: ['critical', 'warning'][i % 2],
      title: `Violacao #${1000 + i}`,
      message: 'Notificacao nao entregue ao Slack',
      fields: { dispute_id: uuid(), employee: 'Carlos Silva' },
      url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX',
      last_error: r.reason,
      last_status: 0,
      attempts: (i % 3) + 1,
      permanent: r.permanent,
      created_at: agoH((i + 1) * 8),
      replayed_at: null,
      replayed_by: null,
      replay_success: null,
    });
  }
  const dlq = await post('slack_notification_dlq', dlqEntries);
  console.log(`Inserted ${dlq.length} slack_notification_dlq entries`);

  console.log('Upserted slack_webhook_mttr (view — skipped)');

  // WhatsApp Settings
  await upsert('whatsapp_notification_settings', [WHATSAPP_SETTINGS]);
  console.log('Upserted whatsapp_notification_settings');

  // WhatsApp Logs
  // WhatsApp Logs — clear old rows before inserting fresh
  await fetch(`${SUPABASE_URL}/rest/v1/whatsapp_message_logs`, { method: 'DELETE', headers: H });
  const waLogs = buildWhatsAppLogs();
  const wa = await post('whatsapp_message_logs', waLogs);
  console.log(`Inserted ${wa.length} whatsapp_message_logs`);

  // Mobile Devices — clear stale rows (different UUIDs from prior runs), then upsert
  await fetch(`${SUPABASE_URL}/rest/v1/mobile_devices?device_id=eq.APA91bHPRD45K-test-device-carlos`, {
    method: 'DELETE',
    headers: H,
  });
  await fetch(`${SUPABASE_URL}/rest/v1/mobile_devices?device_id=eq.APA91bHPRD45K-test-device-ana`, {
    method: 'DELETE',
    headers: H,
  });
  await fetch(`${SUPABASE_URL}/rest/v1/mobile_devices?device_id=eq.APA91bHPRD45K-test-device-pedro`, {
    method: 'DELETE',
    headers: H,
  });
  const md = await post('mobile_devices', MOBILE_DEVICES);
  console.log(`Inserted ${md.length} mobile_devices`);

  // FCM Edge Function Logs
  // FCM Edge Function Logs — clear old rows before inserting fresh
  await fetch(`${SUPABASE_URL}/rest/v1/edge_function_logs?function_name=eq.send-push-notification`, { method: 'DELETE', headers: H });
  await fetch(`${SUPABASE_URL}/rest/v1/edge_function_logs?function_name=eq.notify-mobile-violation`, { method: 'DELETE', headers: H });
  const fcmLogs = buildFcmLogs();
  const fcm = await post('edge_function_logs', fcmLogs);
  console.log(`Inserted ${fcm.length} FCM edge_function_logs`);

  console.log('\nAll done!');
})().catch((e) => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
