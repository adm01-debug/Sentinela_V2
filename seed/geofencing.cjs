// Seed: Geofencing module (geofences + employee_geofences + geofence_violations)
const SUPABASE_URL = 'https://jgnmwvzephsozsqmcpzb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnbm13dnplcGhzb3pzcW1jcHpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTE2MDQzNiwiZXhwIjoyMTAwNzM2NDM2fQ.Y4xu0BUNeQiCrP3zva8KmnxDhXYaVMU-R9qHdVavCxQ';

const H = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

async function fetchTable(path, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: H, ...opts });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function post(path, body) {
  return fetchTable(path, { method: 'POST', headers: { ...H, 'Prefer': 'return=representation' }, body: JSON.stringify(body) });
}

const employees = [
  { id: 'e0000000-0000-0000-0000-000000000001', name: 'Carlos Silva' },
  { id: 'e0000000-0000-0000-0000-000000000002', name: 'Mariana Costa' },
  { id: 'e0000000-0000-0000-0000-000000000003', name: 'Roberto Almeida' },
  { id: 'e0000000-0000-0000-0000-000000000004', name: 'Juliana Pereira' },
  { id: 'e0000000-0000-0000-0000-000000000005', name: 'Fernando Santos' },
  { id: 'e0000000-0000-0000-0000-000000000006', name: 'Patrícia Lima' },
  { id: 'e0000000-0000-0000-0000-000000000008', name: 'Aline Souza' },
];

const now = new Date('2026-08-12T12:00:00Z');
const daysAgo = (d) => new Date(now.getTime() - d * 24 * 3600 * 1000).toISOString();

// 5 geofences around São Paulo area
const geofences = [
  {
    name: 'Escritório Central',
    description: 'Sede administrativa da empresa',
    latitude: -23.5505, longitude: -46.6333, radius_meters: 300,
    address: 'Av. Paulista, 1000 - São Paulo, SP',
    color: '#3b82f6', is_active: true, restricted: false, required: true,
    type: 'circle', points_count: 0,
  },
  {
    name: 'Filial Zona Sul',
    description: 'Unidade comercial zona sul',
    latitude: -23.6508, longitude: -46.7100, radius_meters: 250,
    address: 'Av. Santo Amaro, 5000 - São Paulo, SP',
    color: '#22c55e', is_active: true, restricted: false, required: false,
    type: 'circle', points_count: 0,
  },
  {
    name: 'Centro de Dados',
    description: 'Área restrita - datacenter principal',
    latitude: -23.5295, longitude: -46.6423, radius_meters: 150,
    address: 'Av. das Nações Unidas, 14401 - São Paulo, SP',
    color: '#ef4444', is_active: true, restricted: true, required: false,
    type: 'circle', points_count: 0,
  },
  {
    name: 'Coworking Vila Olímpia',
    description: 'Espaço compartilhado para equipes remotas',
    latitude: -23.5955, longitude: -46.6857, radius_meters: 200,
    address: 'Rua Olimpíadas, 100 - São Paulo, SP',
    color: '#f59e0b', is_active: true, restricted: false, required: false,
    type: 'circle', points_count: 0,
  },
  {
    name: 'Depósito Logístico',
    description: 'Centro de distribuição de produtos',
    latitude: -23.4500, longitude: -46.4800, radius_meters: 500,
    address: 'Rod. Hélio Smidt, s/n - Guarulhos, SP',
    color: '#8b5cf6', is_active: true, restricted: true, required: true,
    type: 'circle', points_count: 0,
  },
];

(async () => {
  // 1. Clean existing data (FK-safe order)
  console.log('Cleaning existing data...');
  await fetchTable('geofence_violations?nearest_geofence_id=neq.00000000-0000-0000-0000-000000000000', { method: 'DELETE', headers: H }).catch(() => {});
  await fetchTable('employee_geofences?assigned_at=lt.now()', { method: 'DELETE', headers: H }).catch(() => {});
  await fetchTable('geofences?name=like.*', { method: 'DELETE', headers: H }).catch(() => {});

  // 2. Insert geofences
  console.log('Inserting geofences...');
  const inserted = await post('geofences', geofences);
  console.log(`Inserted ${inserted.length} geofences.`);

  // 3. Assign employees to geofences (each geofence gets 3-5 employees)
  const assignments = [];
  inserted.forEach((geo, idx) => {
    const count = (idx % 3) + 3; // 3, 4, 5, 3, 4
    for (let i = 0; i < count && i < employees.length; i++) {
      assignments.push({
        employee_id: employees[(idx + i) % employees.length].id,
        geofence_id: geo.id,
      });
    }
  });
  console.log(`Inserting ${assignments.length} employee_geofences...`);
  await post('employee_geofences', assignments);

  // 4. Generate violations - some inside allowed geofences, some outside
  const violations = [
    // Outside Escritório Central (would trigger)
    {
      employee_name: 'Carlos Silva', device: 'Notebook-Dell-001',
      latitude: -23.5610, longitude: -46.6560,
      detected_address: 'Av. Rebouças, 1200 - São Paulo, SP',
      nearest_geofence_id: inserted[0].id, distance_meters: 1250,
      action_taken: 'alert', created_at: daysAgo(1),
    },
    {
      employee_name: 'Mariana Costa', device: 'Macbook-Pro-002',
      latitude: -23.5450, longitude: -46.6890,
      detected_address: 'Av. Brigadeiro Faria Lima, 3000 - São Paulo, SP',
      nearest_geofence_id: inserted[0].id, distance_meters: 5300,
      action_taken: 'blocked', created_at: daysAgo(2),
    },
    {
      employee_name: 'Roberto Almeida', device: 'Desktop-HP-003',
      latitude: -23.5500, longitude: -46.6340,
      detected_address: 'Av. Paulista, 1500 - São Paulo, SP',
      nearest_geofence_id: inserted[0].id, distance_meters: 50,
      action_taken: 'alert', created_at: daysAgo(3),
    },
    // Centro de Dados restricted violations
    {
      employee_name: 'Juliana Pereira', device: 'Notebook-Lenovo-004',
      latitude: -23.5290, longitude: -46.6500,
      detected_address: 'Próximo a Av. Nações Unidas - São Paulo, SP',
      nearest_geofence_id: inserted[2].id, distance_meters: 850,
      action_taken: 'blocked', created_at: daysAgo(1),
    },
    {
      employee_name: 'Fernando Santos', device: 'iPhone-15-005',
      latitude: -23.5310, longitude: -46.6440,
      detected_address: 'Marginal Pinheiros - São Paulo, SP',
      nearest_geofence_id: inserted[2].id, distance_meters: 220,
      action_taken: 'blocked', created_at: daysAgo(4),
    },
    // Coworking
    {
      employee_name: 'Patrícia Lima', device: 'Macbook-Air-006',
      latitude: -23.6100, longitude: -46.6800,
      detected_address: 'Av. Berrini, 500 - São Paulo, SP',
      nearest_geofence_id: inserted[3].id, distance_meters: 1700,
      action_taken: 'alert', created_at: daysAgo(2),
    },
    {
      employee_name: 'Aline Souza', device: 'Notebook-Asus-007',
      latitude: -23.5980, longitude: -46.6900,
      detected_address: 'Av. Hélio Pellegrino, 800 - São Paulo, SP',
      nearest_geofence_id: inserted[3].id, distance_meters: 600,
      action_taken: 'alert', created_at: daysAgo(5),
    },
    // Depósito Logístico
    {
      employee_name: 'Carlos Silva', device: 'Celular-Samsung-008',
      latitude: -23.4600, longitude: -46.4900,
      detected_address: 'Próximo Rod. Hélio Smidt - Guarulhos, SP',
      nearest_geofence_id: inserted[4].id, distance_meters: 1400,
      action_taken: 'blocked', created_at: daysAgo(6),
    },
    {
      employee_name: 'Roberto Almeida', device: 'Tablet-iPad-009',
      latitude: -23.4480, longitude: -46.4750,
      detected_address: 'Av. Guarulhos, 1500 - Guarulhos, SP',
      nearest_geofence_id: inserted[4].id, distance_meters: 600,
      action_taken: 'blocked', created_at: daysAgo(7),
    },
    // Filial Zona Sul
    {
      employee_name: 'Mariana Costa', device: 'Notebook-Acer-010',
      latitude: -23.6700, longitude: -46.7000,
      detected_address: 'Av. Ibirapuera, 2000 - São Paulo, SP',
      nearest_geofence_id: inserted[1].id, distance_meters: 2400,
      action_taken: 'alert', created_at: daysAgo(8),
    },
  ];
  console.log(`Inserting ${violations.length} geofence_violations...`);
  await post('geofence_violations', violations);

  // Verify
  const gCount = await fetchTable('geofences?select=id', { headers: { ...H, 'Prefer': 'count=exact' } });
  const egCount = await fetchTable('employee_geofences?select=id', { headers: { ...H, 'Prefer': 'count=exact' } });
  const vCount = await fetchTable('geofence_violations?select=id', { headers: { ...H, 'Prefer': 'count=exact' } });
  console.log(`\nTotals: geofences=${gCount.length}, employee_geofences=${egCount.length}, violations=${vCount.length}`);
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });