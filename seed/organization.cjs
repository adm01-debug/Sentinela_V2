// Seed: Organization module
// Tables: departments, teams, team_members, work_schedules (already done), employee_schedules, achievements, gamification_leaderboard
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

async function del(path) {
  return fetchTable(path, { method: 'DELETE', headers: { ...H, 'Prefer': 'return=representation' } });
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

(async () => {
  // ============================================================
  // 1. DEPARTMENTS
  // ============================================================
  console.log('=== DEPARTMENTS ===');
  await del('departments?created_at=lt.now()').catch(() => {});

  const departments = [
    { name: 'Tecnologia', description: 'Desenvolvimento e infraestrutura' },
    { name: 'Comercial', description: 'Vendas e atendimento ao cliente' },
    { name: 'Marketing', description: 'Comunicação e marketing digital' },
    { name: 'Financeiro', description: 'Contabilidade e finanças' },
    { name: 'Recursos Humanos', description: 'Gestão de pessoas e cultura' },
    { name: 'Operações', description: 'Logística e operações' },
    { name: 'Design', description: 'UX/UI e design gráfico' },
  ];
  const insertedDepts = await post('departments', departments);
  console.log(`Inserted ${insertedDepts.length} departments.`);

  // ============================================================
  // 2. TEAMS + TEAM_MEMBERS
  // ============================================================
  console.log('=== TEAMS ===');
  await del('team_members?joined_at=lt.now()').catch(() => {});
  await del('teams?created_at=lt.now()').catch(() => {});

  const teams = [
    { name: 'Engenharia Backend', description: 'APIs e serviços core', leader_name: 'Carlos Silva' },
    { name: 'Engenharia Frontend', description: 'UI/UX e dashboards', leader_name: 'Mariana Costa' },
    { name: 'DevOps & SRE', description: 'Infraestrutura e observabilidade', leader_name: 'Fernando Santos' },
    { name: 'Vendas B2B', description: 'Vendas para clientes corporativos', leader_name: 'Roberto Almeida' },
    { name: 'Customer Success', description: 'Pós-venda e retenção', leader_name: 'Juliana Pereira' },
    { name: 'Growth Marketing', description: 'Aquisição e funil de conversão', leader_name: 'Patrícia Lima' },
    { name: 'Security Operations', description: 'SOC e resposta a incidentes', leader_name: 'Aline Souza' },
  ];
  const insertedTeams = await post('teams', teams);
  console.log(`Inserted ${insertedTeams.length} teams.`);

  const teamMembers = [];
  insertedTeams.forEach((team, i) => {
    // 3-5 members per team, rotating through employees
    const memberCount = (i % 3) + 3;
    for (let j = 0; j < memberCount; j++) {
      const emp = employees[(i + j) % employees.length];
      teamMembers.push({
        team_id: team.id,
        employee_name: emp.name,
        role: j === 0 ? 'lead' : 'member',
      });
    }
  });
  const insertedMembers = await post('team_members', teamMembers);
  console.log(`Inserted ${insertedMembers.length} team_members.`);

  // ============================================================
  // 3. EMPLOYEE_SCHEDULES
  // ============================================================
  console.log('=== EMPLOYEE_SCHEDULES ===');
  await del('employee_schedules?created_at=lt.now()').catch(() => {});

  // Get existing work_schedules
  const schedules = await fetchTable('work_schedules?select=id,name');
  const empSchedules = [];
  employees.forEach((emp, i) => {
    const schedule = schedules[i % schedules.length];
    empSchedules.push({
      employee_id: emp.id,
      schedule_id: schedule.id,
      effective_from: '2026-01-01',
    });
  });
  const insertedES = await post('employee_schedules', empSchedules);
  console.log(`Inserted ${insertedES.length} employee_schedules.`);

  // ============================================================
  // 4. ACHIEVEMENTS
  // ============================================================
  console.log('=== ACHIEVEMENTS ===');
  await del('achievements?created_at=lt.now()').catch(() => {});

  const achievements = [
    { name: 'Primeira Semana Completa', description: 'Concluiu 5 dias consecutivos sem faltas', icon: 'calendar-check', points: 50, category: 'attendance', unlocked_count: 6 },
    { name: 'Velocista', description: 'Alcançou 95% de produtividade diária', icon: 'zap', points: 100, category: 'productivity', unlocked_count: 4 },
    { name: 'Mestre do Foco', description: 'Manteve 4h de foco profundo sem interrupção', icon: 'target', points: 150, category: 'productivity', unlocked_count: 2 },
    { name: 'Pontualidade Perfeita', description: '30 dias sem atrasos', icon: 'clock-check', points: 75, category: 'attendance', unlocked_count: 5 },
    { name: 'Colaborador do Mês', description: 'Reconhecimento mensal do time', icon: 'star', points: 200, category: 'recognition', unlocked_count: 1 },
    { name: 'Top Performer', description: 'Maior pontuação do mês', icon: 'trophy', points: 300, category: 'recognition', unlocked_count: 1 },
    { name: 'Mentor', description: 'Ajudou 10+ colegas no mês', icon: 'heart', points: 250, category: 'social', unlocked_count: 2 },
    { name: 'Zero Violações', description: 'Mês sem violações de segurança', icon: 'shield-check', points: 100, category: 'security', unlocked_count: 7 },
    { name: 'Inovador', description: 'Sugeriu melhoria implementada', icon: 'lightbulb', points: 175, category: 'innovation', unlocked_count: 1 },
    { name: 'Maratonista', description: '100+ horas produtivas no mês', icon: 'flame', points: 400, category: 'productivity', unlocked_count: 1 },
  ];
  const insertedAch = await post('achievements', achievements);
  console.log(`Inserted ${insertedAch.length} achievements.`);

  // ============================================================
  // 5. GAMIFICATION_LEADERBOARD
  // ============================================================
  console.log('=== GAMIFICATION_LEADERBOARD ===');
  await del('gamification_leaderboard?updated_at=lt.now()').catch(() => {});

  // Build leaderboard from employees with realistic varying points
  const pointsByEmployee = [
    { emp: employees[3], points: 1850, level: 7, badges: ['star', 'trophy', 'flame'] }, // Juliana - top performer
    { emp: employees[4], points: 1620, level: 6, badges: ['zap', 'clock-check', 'shield-check'] }, // Fernando
    { emp: employees[1], points: 1480, level: 6, badges: ['star', 'heart', 'zap'] }, // Mariana
    { emp: employees[0], points: 1320, level: 5, badges: ['calendar-check', 'target', 'shield-check'] }, // Carlos
    { emp: employees[5], points: 1150, level: 4, badges: ['lightbulb', 'shield-check'] }, // Patrícia
    { emp: employees[6], points: 980, level: 4, badges: ['calendar-check', 'heart'] }, // Aline
    { emp: employees[2], points: 720, level: 3, badges: ['clock-check'] }, // Roberto - new/underperform
  ];

  const leaderboard = pointsByEmployee.map(({ emp, points, level, badges }) => ({
    employee_id: emp.id,
    employee_name: emp.name,
    points,
    level,
    badges: JSON.stringify(badges),
  }));
  const insertedLB = await post('gamification_leaderboard', leaderboard);
  console.log(`Inserted ${insertedLB.length} gamification_leaderboard entries.`);

  // ============================================================
  // VERIFY TOTALS
  // ============================================================
  console.log('\n=== TOTALS ===');
  for (const t of ['departments', 'teams', 'team_members', 'employee_schedules', 'achievements', 'gamification_leaderboard']) {
    const data = await fetchTable(`${t}?select=id&limit=1`).catch(() => []);
    // Get total count via separate call
    const all = await fetchTable(`${t}?select=id`).catch(() => []);
    console.log(`${t}: ${Array.isArray(all) ? all.length : '?'}`);
  }
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });