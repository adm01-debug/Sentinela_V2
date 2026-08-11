// Quick patch: update gamification_leaderboard to use native JSON arrays
const SUPABASE_URL = 'https://jgnmwvzephsozsqmcpzb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnbm13dnplcGhzb3pzcW1jcHpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTE2MDQzNiwiZXhwIjoyMTAwNzM2NDM2fQ.Y4xu0BUNeQiCrP3zva8KmnxDhXYaVMU-R9qHdVavCxQ';

const H = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

const employees = [
  { id: 'e0000000-0000-0000-0000-000000000001', name: 'Carlos Silva' },
  { id: 'e0000000-0000-0000-0000-000000000002', name: 'Mariana Costa' },
  { id: 'e0000000-0000-0000-0000-000000000003', name: 'Roberto Almeida' },
  { id: 'e0000000-0000-0000-0000-000000000004', name: 'Juliana Pereira' },
  { id: 'e0000000-0000-0000-0000-000000000005', name: 'Fernando Santos' },
  { id: 'e0000000-0000-0000-0000-000000000006', name: 'Patrícia Lima' },
  { id: 'e0000000-0000-0000-0000-000000000008', name: 'Aline Souza' },
];

const pointsByEmployee = [
  { emp: employees[3], points: 1850, level: 7, badges: ['star', 'trophy', 'flame'] },
  { emp: employees[4], points: 1620, level: 6, badges: ['zap', 'clock-check', 'shield-check'] },
  { emp: employees[1], points: 1480, level: 6, badges: ['star', 'heart', 'zap'] },
  { emp: employees[0], points: 1320, level: 5, badges: ['calendar-check', 'target', 'shield-check'] },
  { emp: employees[5], points: 1150, level: 4, badges: ['lightbulb', 'shield-check'] },
  { emp: employees[6], points: 980, level: 4, badges: ['calendar-check', 'heart'] },
  { emp: employees[2], points: 720, level: 3, badges: ['clock-check'] },
];

(async () => {
  // 1. Delete existing rows
  console.log('Deleting existing leaderboard entries...');
  await fetch(`${SUPABASE_URL}/rest/v1/gamification_leaderboard?updated_at=lt.now()`, { method: 'DELETE', headers: H });

  // 2. Insert with native JSON arrays (no JSON.stringify)
  const rows = pointsByEmployee.map(({ emp, points, level, badges }) => ({
    employee_id: emp.id,
    employee_name: emp.name,
    points,
    level,
    badges,  // native array - PostgREST serializes as JSONB
  }));
  console.log('Inserting leaderboard entries with native JSON arrays...');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/gamification_leaderboard`, {
    method: 'POST',
    headers: { ...H, 'Prefer': 'return=representation' },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`Insert failed: ${res.status} ${await res.text()}`);
  const inserted = await res.json();
  console.log(`Inserted ${inserted.length} entries.`);
  // Verify shape
  console.log('First entry badges:', typeof inserted[0].badges, Array.isArray(inserted[0].badges) ? 'is array' : 'NOT array');
  console.log('First entry sample:', JSON.stringify(inserted[0], null, 2));
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });