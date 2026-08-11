const https = require('https');
const fs = require('fs');

const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnbm13dnplcGhzb3pzcW1jcHpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTE2MDQzNiwiZXhwIjoyMTAwNzM2NDM2fQ.Y4xu0BUNeQiCrP3zva8KmnxDhXYaVMU-R9qHdVavCxQ';

function request(opts, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, data: d }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  // 1) Delete all time_entries (simpler than upsert)
  const del = await request({
    hostname: 'jgnmwvzephsozsqmcpzb.supabase.co',
    path: '/rest/v1/time_entries?id=gte.00000000-0000-0000-0000-000000000000',
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer ' + SERVICE_KEY,
      'apikey': SERVICE_KEY,
      'Prefer': 'return=count',
    }
  });
  console.log('delete:', del.status, del.data.slice(0, 200));

  // 2) Insert new
  const rows = JSON.parse(fs.readFileSync('seed/time_entries.json'));
  const body = JSON.stringify(rows);
  const ins = await request({
    hostname: 'jgnmwvzephsozsqmcpzb.supabase.co',
    path: '/rest/v1/time_entries',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + SERVICE_KEY,
      'apikey': SERVICE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      'Content-Length': Buffer.byteLength(body),
    }
  }, body);
  console.log('insert:', ins.status, '— first row:', JSON.parse(ins.data)[0]?.clock_in);

  // 3) Timesheets update for current week
  const tsBody = JSON.stringify(rows.map((r, i) => ({
    id: `97000000-0000-0000-0000-00000000000${(i + 1).toString().padStart(1, '0')}`.slice(0, 36),
    employee_id: r.employee_id,
    period_type: 'weekly',
    period_start: r.clock_in.slice(0, 10),
    period_end: new Date(new Date(r.clock_in).getTime() + 4 * 86400000).toISOString().slice(0, 10),
    total_hours: 40 + Math.random() * 5,
    regular_hours: 40,
    overtime_hours: Math.random() < 0.5 ? 0 : Math.round(Math.random() * 1.5 * 10) / 10,
    break_hours: 5,
    status: i % 3 === 0 ? 'pending_approval' : 'approved',
    approved_by: i % 3 === 0 ? null : 'b7ce87c2-ba3c-42b4-9105-9579dccdfa3a',
    approved_at: i % 3 === 0 ? null : '2026-08-14T10:00:00+00:00',
    notes: null
  })));

  const delTs = await request({
    hostname: 'jgnmwvzephsozsqmcpzb.supabase.co',
    path: '/rest/v1/timesheets?id=gte.97000000-0000-0000-0000-000000000000',
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer ' + SERVICE_KEY,
      'apikey': SERVICE_KEY,
      'Prefer': 'return=count',
    }
  });
  console.log('delete timesheets:', delTs.status);

  const insTs = await request({
    hostname: 'jgnmwvzephsozsqmcpzb.supabase.co',
    path: '/rest/v1/timesheets',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + SERVICE_KEY,
      'apikey': SERVICE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      'Content-Length': Buffer.byteLength(tsBody),
    }
  }, tsBody);
  console.log('insert timesheets:', insTs.status);

  // 4) Employee status: todos online com clock_in de hoje (10/08 ou 11/08)
  const esRows = [
    {id:'98000000-0000-0000-0000-000000000001',employee_id:'e0000000-0000-0000-0000-000000000001',status:'online',current_task:'Revisão de artes',current_project:'67000000-0000-0000-0000-000000000001',last_activity_at:'2026-08-11T10:15:00-03:00',clock_in_at:'2026-08-11T08:02:00-03:00',total_today_minutes:130,idle_minutes:12,updated_at:'2026-08-11T10:15:00-03:00'},
    {id:'98000000-0000-0000-0000-000000000002',employee_id:'e0000000-0000-0000-0000-000000000002',status:'online',current_task:'Catalogação de brindes',current_project:'67000000-0000-0000-0000-000000000001',last_activity_at:'2026-08-11T10:15:00-03:00',clock_in_at:'2026-08-11T09:00:00-03:00',total_today_minutes:75,idle_minutes:5,updated_at:'2026-08-11T10:15:00-03:00'},
    {id:'98000000-0000-0000-0000-000000000003',employee_id:'e0000000-0000-0000-0000-000000000003',status:'away',current_task:'Reunião com fornecedor',current_project:'67000000-0000-0000-0000-000000000002',last_activity_at:'2026-08-11T10:00:00-03:00',clock_in_at:'2026-08-11T08:00:00-03:00',total_today_minutes:120,idle_minutes:0,updated_at:'2026-08-11T10:00:00-03:00'},
    {id:'98000000-0000-0000-0000-000000000004',employee_id:'e0000000-0000-0000-0000-000000000004',status:'online',current_task:'Preparação de treinamento',current_project:'67000000-0000-0000-0000-000000000002',last_activity_at:'2026-08-11T10:15:00-03:00',clock_in_at:'2026-08-11T08:05:00-03:00',total_today_minutes:130,idle_minutes:8,updated_at:'2026-08-11T10:15:00-03:00'},
    {id:'98000000-0000-0000-0000-000000000005',employee_id:'e0000000-0000-0000-0000-000000000005',status:'online',current_task:'Levantamento de requisitos',current_project:'67000000-0000-0000-0000-000000000004',last_activity_at:'2026-08-11T10:15:00-03:00',clock_in_at:'2026-08-11T09:00:00-03:00',total_today_minutes:75,idle_minutes:2,updated_at:'2026-08-11T10:15:00-03:00'},
    {id:'98000000-0000-0000-0000-000000000006',employee_id:'e0000000-0000-0000-0000-000000000006',status:'online',current_task:'Wireframes do portal',current_project:'67000000-0000-0000-0000-000000000003',last_activity_at:'2026-08-11T10:15:00-03:00',clock_in_at:'2026-08-11T09:05:00-03:00',total_today_minutes:70,idle_minutes:3,updated_at:'2026-08-11T10:15:00-03:00'}
  ];
  const esBody = JSON.stringify(esRows);
  const delEs = await request({
    hostname: 'jgnmwvzephsozsqmcpzb.supabase.co',
    path: '/rest/v1/employee_status?id=gte.98000000-0000-0000-0000-000000000000',
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer ' + SERVICE_KEY,
      'apikey': SERVICE_KEY,
      'Prefer': 'return=count',
    }
  });
  console.log('delete emp_status:', delEs.status);
  const insEs = await request({
    hostname: 'jgnmwvzephsozsqmcpzb.supabase.co',
    path: '/rest/v1/employee_status',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + SERVICE_KEY,
      'apikey': SERVICE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      'Content-Length': Buffer.byteLength(esBody),
    }
  }, esBody);
  console.log('insert emp_status:', insEs.status);
}

main().catch(console.error);
