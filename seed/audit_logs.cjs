// Seed: Logs de Auditoria
// Tables: login_security_events, settings_audit_log
const SUPABASE_URL = 'https://jgnmwvzephsozsqmcpzb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnbm13dnplcGhzb3pzcW1jcHpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTE2MDQzNiwiZXhwIjoyMTAwNzM2NDM2fQ.Y4xu0BUNeQiCrP3zva8KmnxDhXYaVMU-R9qHdVavCxQ';
const H = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' };

const USER_UUID = 'b7ce87c2-ba3c-42b4-9105-9579dccdfa3a';

async function post(path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { method: 'POST', headers: { ...H, 'Prefer': 'return=representation' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  return res.json();
}
async function del(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { method: 'DELETE', headers: H });
  return res.ok;
}

(async () => {
  // ============================================================
  // 1. LOGIN SECURITY EVENTS
  // ============================================================
  console.log('=== LOGIN SECURITY EVENTS ===');
  await del('login_security_events?created_at=lt.now()').catch(() => {});

  const now = Date.now();
  const ago = (mins) => new Date(now - mins * 60 * 1000).toISOString();

  const securityEvents = [
    { user_id: USER_UUID, event_type: 'login', ip_address: '192.168.1.45', user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0', device_fingerprint: 'fp_desktop_win_01', location: 'Sao Paulo, BR', metadata: { session_id: 'sess_001' }, created_at: ago(15) },
    { user_id: USER_UUID, event_type: 'login', ip_address: '187.45.23.110', user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5) Safari/604.1', device_fingerprint: 'fp_ios_01', location: 'Sao Paulo, BR', metadata: { session_id: 'sess_002' }, created_at: ago(180) },
    { user_id: USER_UUID, event_type: 'login', ip_address: '201.20.45.77', user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) Safari/605.1.15', device_fingerprint: 'fp_mac_01', location: 'Rio de Janeiro, BR', metadata: { session_id: 'sess_003' }, created_at: ago(720) },
    { user_id: USER_UUID, event_type: 'failed_login', ip_address: '45.33.32.156', user_agent: 'curl/8.4.0', device_fingerprint: null, location: 'Unknown', metadata: { reason: 'invalid_password', attempts: 1 }, created_at: ago(60) },
    { user_id: USER_UUID, event_type: 'failed_login', ip_address: '45.33.32.156', user_agent: 'curl/8.4.0', device_fingerprint: null, location: 'Unknown', metadata: { reason: 'invalid_password', attempts: 2 }, created_at: ago(58) },
    { user_id: USER_UUID, event_type: 'failed_login', ip_address: '45.33.32.156', user_agent: 'curl/8.4.0', device_fingerprint: null, location: 'Unknown', metadata: { reason: 'invalid_password', attempts: 3, flagged: true }, created_at: ago(56) },
    { user_id: USER_UUID, event_type: 'logout', ip_address: '192.168.1.45', user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0', device_fingerprint: 'fp_desktop_win_01', location: 'Sao Paulo, BR', metadata: { session_duration_min: 240 }, created_at: ago(8 * 60) },
    { user_id: USER_UUID, event_type: 'password_reset', ip_address: '192.168.1.45', user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0', device_fingerprint: 'fp_desktop_win_01', location: 'Sao Paulo, BR', metadata: { email_sent: true }, created_at: ago(3 * 24 * 60) },
    { user_id: USER_UUID, event_type: 'login', ip_address: '177.92.45.10', user_agent: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/127.0', device_fingerprint: 'fp_linux_01', location: 'Belo Horizonte, BR', metadata: { session_id: 'sess_004' }, created_at: ago(2 * 24 * 60) },
    { user_id: USER_UUID, event_type: 'login', ip_address: '192.168.1.45', user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0', device_fingerprint: 'fp_desktop_win_01', location: 'Sao Paulo, BR', metadata: { session_id: 'sess_005' }, created_at: ago(3 * 24 * 60) },
    { user_id: USER_UUID, event_type: 'logout', ip_address: '192.168.1.45', user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0', device_fingerprint: 'fp_desktop_win_01', location: 'Sao Paulo, BR', metadata: { session_duration_min: 360 }, created_at: ago(5 * 24 * 60) },
    { user_id: USER_UUID, event_type: 'failed_login', ip_address: '103.25.67.89', user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0', device_fingerprint: null, location: 'Singapore', metadata: { reason: 'account_locked' }, created_at: ago(7 * 24 * 60) },
  ];
  const ins1 = await post('login_security_events', securityEvents);
  console.log(`Inserted ${ins1.length} login_security_events.`);

  // ============================================================
  // 2. SETTINGS AUDIT LOG
  // ============================================================
  console.log('=== SETTINGS AUDIT LOG ===');
  await del('settings_audit_log?created_at=lt.now()').catch(() => {});

  const settingsEvents = [
    { user_id: USER_UUID, user_email: 'ti@promobrindes.com.br', action: 'update', entity_type: 'security_settings', entity_id: 'a0000000-0000-0000-0000-000000000001', entity_name: 'Bloqueio Automatico', old_value: { enabled: false, threshold: 3 }, new_value: { enabled: true, threshold: 5 }, created_at: ago(30) },
    { user_id: USER_UUID, user_email: 'ti@promobrindes.com.br', action: 'create', entity_type: 'alert_rule', entity_id: 'a0000000-0000-0000-0000-000000000002', entity_name: 'Violacao de Geofence', old_value: null, new_value: { severity: 'high', notify: true }, created_at: ago(120) },
    { user_id: USER_UUID, user_email: 'ti@promobrindes.com.br', action: 'update', entity_type: 'notification_settings', entity_id: 'a0000000-0000-0000-0000-000000000003', entity_name: 'Notificacoes Email', old_value: { enabled: false }, new_value: { enabled: true, recipients: ['ti@promobrindes.com.br'] }, created_at: ago(180) },
    { user_id: USER_UUID, user_email: 'ti@promobrindes.com.br', action: 'update', entity_type: 'work_schedule', entity_id: '57000000-0000-0000-0000-000000000001', entity_name: 'Jornada Comercial 8h', old_value: { grace_period: 10 }, new_value: { grace_period: 15 }, created_at: ago(360) },
    { user_id: USER_UUID, user_email: 'ti@promobrindes.com.br', action: 'create', entity_type: 'department', entity_id: 'd0000000-0000-0000-0000-000000000007', entity_name: 'Design', old_value: null, new_value: { name: 'Design', description: 'UX/UI e design grafico' }, created_at: ago(24 * 60) },
    { user_id: USER_UUID, user_email: 'ti@promobrindes.com.br', action: 'delete', entity_type: 'geofence', entity_id: 'a0000000-0000-0000-0000-000000000099', entity_name: 'Antiga Matriz', old_value: { name: 'Antiga Matriz', radius: 200 }, new_value: null, created_at: ago(2 * 24 * 60) },
    { user_id: USER_UUID, user_email: 'ti@promobrindes.com.br', action: 'update', entity_type: 'integration', entity_id: 'a0000000-0000-0000-0000-000000000010', entity_name: 'Slack Webhook', old_value: { enabled: false }, new_value: { enabled: true, url: 'https://hooks.slack.com/services/***' }, created_at: ago(3 * 24 * 60) },
    { user_id: USER_UUID, user_email: 'ti@promobrindes.com.br', action: 'update', entity_type: 'company_settings', entity_id: 'c0000000-0000-0000-0000-000000000001', entity_name: 'Sentinela Promo', old_value: { timezone: 'UTC' }, new_value: { timezone: 'America/Sao_Paulo' }, created_at: ago(5 * 24 * 60) },
    { user_id: USER_UUID, user_email: 'ti@promobrindes.com.br', action: 'create', entity_type: 'role', entity_id: 'a0000000-0000-0000-0000-000000000004', entity_name: 'Viewer', old_value: null, new_value: { permissions: ['read'] }, created_at: ago(7 * 24 * 60) },
    { user_id: USER_UUID, user_email: 'ti@promobrindes.com.br', action: 'update', entity_type: 'audit_retention', entity_id: 'a0000000-0000-0000-0000-000000000020', entity_name: 'Retencao de Logs', old_value: { days: 30 }, new_value: { days: 90 }, created_at: ago(10 * 24 * 60) },
  ];
  const ins2 = await post('settings_audit_log', settingsEvents);
  console.log(`Inserted ${ins2.length} settings_audit_log.`);

  console.log('\n=== TOTALS ===');
  for (const t of ['login_security_events', 'settings_audit_log']) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${t}?select=id`, { headers: H });
    const data = await res.json();
    console.log(`${t}: ${data.length}`);
  }
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });