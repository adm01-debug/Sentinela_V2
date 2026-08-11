const https = require('https');
const fs = require('fs');

const SUPABASE_URL = 'https://jgnmwvzephsozsqmcpzb.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnbm13dnplcGhzb3pzcW1jcHpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTE2MDQzNiwiZXhwIjoyMTAwNzM2NDM2fQ.Y4xu0BUNeQiCrP3zva8KmnxDhXYaVMU-R9qHdVavCxQ';

async function restPost(table, rows) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(rows);
    const opts = {
      hostname: 'jgnmwvzephsozsqmcpzb.supabase.co',
      path: `/rest/v1/${table}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        'Content-Length': Buffer.byteLength(body),
      }
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const parsed = data ? JSON.parse(data) : [];
        resolve({ status: res.statusCode, data: parsed });
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const timesheets = JSON.parse(fs.readFileSync('seed/timesheets.json'));
  const empStatus = JSON.parse(fs.readFileSync('seed/employee_status.json'));

  const [rTs, rEs] = await Promise.all([
    restPost('timesheets', timesheets),
    restPost('employee_status', empStatus),
  ]);

  console.log('=== timesheets ===');
  console.log('status:', rTs.status);
  if (Array.isArray(rTs.data)) {
    rTs.data.forEach(r => console.log(r.id, r.employee_id, r.period_start, r.total_hours, r.status));
  } else {
    console.log(JSON.stringify(rTs.data));
  }

  console.log('\n=== employee_status ===');
  console.log('status:', rEs.status);
  if (Array.isArray(rEs.data)) {
    rEs.data.forEach(r => console.log(r.id, r.employee_id, r.status, r.current_activity));
  } else {
    console.log(JSON.stringify(rEs.data));
  }
}

main().catch(console.error);
