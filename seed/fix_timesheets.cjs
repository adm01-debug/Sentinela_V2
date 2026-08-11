const https = require('https');
const SVC = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnbm13dnplcGhzb3pzcW1jcHpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTE2MDQzNiwiZXhwIjoyMTAwNzM2NDM2fQ.Y4xu0BUNeQiCrP3zva8KmnxDhXYaVMU-R9qHdVavCxQ';

const employees = [
  { id: 'e0000000-0000-0000-0000-000000000001', total: 42.5, ot: 2.5 },
  { id: 'e0000000-0000-0000-0000-000000000002', total: 41.0, ot: 1.0 },
  { id: 'e0000000-0000-0000-0000-000000000003', total: 40.0, ot: 0 },
  { id: 'e0000000-0000-0000-0000-000000000004', total: 44.5, ot: 4.5 },
  { id: 'e0000000-0000-0000-0000-000000000005', total: 40.0, ot: 0 },
  { id: 'e0000000-0000-0000-0000-000000000006', total: 43.0, ot: 3.0 },
];

const rows = employees
  .map((e, i) => ({
    id: `97000000-0000-0000-0000-00000000000${(i + 1).toString().padStart(1, '0')}`,
    employee_id: e.id,
    period_type: 'weekly',
    period_start: '2026-08-10',
    period_end: '2026-08-16',
    total_hours: e.total,
    regular_hours: 40,
    overtime_hours: e.ot,
    break_hours: 5,
    status: i % 2 === 0 ? 'pending_approval' : 'approved',
    approved_by: i % 2 === 0 ? null : 'b7ce87c2-ba3c-42b4-9105-9579dccdfa3a',
    approved_at: i % 2 === 0 ? null : '2026-08-17T10:00:00+00:00',
    notes: null
  }))
  .filter(r => r.id !== '97000000-0000-0000-0000-000000000001'); // já existe

const body = JSON.stringify(rows);
const req = https.request({
  hostname: 'jgnmwvzephsozsqmcpzb.supabase.co', path: '/rest/v1/timesheets',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + SVC, 'apikey': SVC, 'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    'Content-Length': Buffer.byteLength(body)
  }
}, res => {
  let d = ''; res.on('data', c => d += c);
  res.on('end', () => {
    console.log('status:', res.statusCode);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const arr = JSON.parse(d);
      arr.forEach(r => console.log(r.id, r.employee_id.slice(-12), r.total_hours + 'h', r.overtime_hours + 'h OT', r.status));
    } else {
      console.log(d.slice(0, 500));
    }
  });
});
req.write(body); req.end();
