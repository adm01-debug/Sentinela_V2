// Seed: Edge Function Logs (escalate-dispute-sla) for /admin/dispute-escalation-audit
const SUPABASE_URL = 'https://jgnmwvzephsozsqmcpzb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnbm13dnplcGhzb3pzcW1jcHpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTE2MDQzNiwiZXhwIjoyMTAwNzM2NDM2fQ.Y4xu0BUNeQiCrP3zva8KmnxDhXYaVMU-R9qHdVavCxQ';
const H = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' };
const COMPANY_ID = 'c0000000-0000-0000-0000-000000000001';

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
  // Clear existing escalate-dispute-sla entries
  await del(`edge_function_logs?function_name=eq.escalate-dispute-sla`);

  const now = Date.now();
  const ago = (mins) => new Date(now - mins * 60 * 1000).toISOString();
  const reqId = () => Math.random().toString(36).slice(2, 10);

  // Realistic exec pattern: runs every 15min for the last 24h (~96 entries)
  // Mix: ok runs, breaches, critical escalations, warnings, occasional errors
  const entries = [];
  for (let i = 0; i < 96; i++) {
    const minutesAgo = i * 15 + Math.floor(Math.random() * 3);
    const r = Math.random();
    let status, duration_ms, severity, error_message = null;
    let escalated_count = 0;
    let checked_count = Math.floor(Math.random() * 8) + 2;

    if (r < 0.78) {
      // healthy: no breaches
      status = 200; duration_ms = Math.floor(Math.random() * 200) + 80; severity = 'ok';
    } else if (r < 0.90) {
      // warning: some approaching deadline
      status = 200; duration_ms = Math.floor(Math.random() * 300) + 150; severity = 'warning';
      escalated_count = Math.floor(Math.random() * 2);
    } else if (r < 0.97) {
      // critical escalation
      status = 200; duration_ms = Math.floor(Math.random() * 400) + 200; severity = 'critical';
      escalated_count = Math.floor(Math.random() * 3) + 1;
    } else {
      // breach
      status = 200; duration_ms = Math.floor(Math.random() * 500) + 250; severity = 'breached';
      escalated_count = Math.floor(Math.random() * 4) + 1;
    }
    // occasional transient error
    if (Math.random() < 0.04) {
      status = 500; error_message = 'connection_timeout'; severity = 'error'; escalated_count = 0; checked_count = 0;
    }

    entries.push({
      function_name: 'escalate-dispute-sla',
      request_id: reqId(),
      company_id: COMPANY_ID,
      method: 'POST',
      status,
      duration_ms,
      error_message,
      payload_summary: { severity, escalated_count, checked_count, threshold_hours: 4 },
      created_at: ago(minutesAgo),
    });
  }

  const ins = await post('edge_function_logs', entries);
  console.log(`Inserted ${ins.length} escalate-dispute-sla logs.`);

  // Also seed slack-fallback-test and slack-notify:fallback for the related cards
  await del(`edge_function_logs?function_name=eq.slack-fallback-test`);
  const tests = [];
  for (let i = 0; i < 8; i++) {
    tests.push({
      function_name: 'slack-fallback-test',
      request_id: reqId(),
      company_id: COMPANY_ID,
      method: 'POST',
      status: 200,
      duration_ms: Math.floor(Math.random() * 600) + 200,
      payload_summary: { triggered_by: 'auto_monitor', recipients_count: 3, resend_id: `rs_${reqId()}`, error: null },
      created_at: ago(i * 60 + 30),
    });
  }
  await post('edge_function_logs', tests);

  await del(`edge_function_logs?function_name=eq.slack-notify%3Afallback`);
  const fallbacks = [];
  for (let i = 0; i < 12; i++) {
    const ok = Math.random() > 0.25;
    fallbacks.push({
      function_name: 'slack-notify:fallback',
      request_id: reqId(),
      company_id: COMPANY_ID,
      method: 'POST',
      status: ok ? 200 : 503,
      duration_ms: Math.floor(Math.random() * 800) + 200,
      error_message: ok ? null : 'resend_api_timeout',
      payload_summary: { fallback: { delivered: ok ? 4 : 0, recipients: 4, reason: ok ? 'slack_unreachable' : 'resend_failed' } },
      created_at: ago(i * 90 + 10),
    });
  }
  await post('edge_function_logs', fallbacks);

  // Verify totals
  for (const fn of ['escalate-dispute-sla', 'slack-fallback-test', 'slack-notify:fallback']) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/edge_function_logs?select=id&function_name=eq.${encodeURIComponent(fn)}`, { headers: H });
    const data = await res.json();
    console.log(`${fn}: ${data.length}`);
  }
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });