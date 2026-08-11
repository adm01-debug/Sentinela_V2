// Seed: ai_analysis_reports (used by /analytics + /reports + /ai-analysis)
// All required + optional columns populated based on schema probe.
const SUPABASE_URL = 'https://jgnmwvzephsozsqmcpzb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnbm13dnplcGhzb3pzcW1jcHpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTE2MDQzNiwiZXhwIjoyMTAwNzM2NDM2fQ.Y4xu0BUNeQiCrP3zva8KmnxDhXYaVMU-R9qHdVavCxQ';

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
function daysAgo(d) {
  const t = new Date(now.getTime() - d * 24 * 3600 * 1000);
  return t.toISOString();
}

const rows = [
  {
    employee_name: 'Carlos Silva',
    report_type: 'productivity',
    summary: 'Carlos manteve alta produtividade nas últimas 4 semanas, com média de 7.2h de trabalho ativo por dia. Foco em tarefas técnicas complexas.',
    risk_score: 22,
    insights: [
      'Foco consistente em código com baixo tempo ocioso',
      'Padrão de pausas irregulares a cada 90-120min',
      'Uso predominante de IDEs e ferramentas de documentação'
    ],
    recommendations: [
      'Incentivar pausas estruturadas para evitar fadiga',
      'Considerar tarefas de maior complexidade para engajamento',
      'Revisar distribuição de reuniões ao longo da semana'
    ],
    raw_data: { avg_active_hours: 7.2, idle_pct: 12, top_app: 'VS Code' },
    created_at: daysAgo(1)
  },
  {
    employee_name: 'Carlos Silva',
    report_type: 'risk',
    summary: 'Risco baixo. Sem sinais de comportamento anômalo ou uso excessivo de canais não monitorados.',
    risk_score: 18,
    insights: [
      'Acessos externos dentro do esperado',
      'Nenhuma tentativa de exfiltração de dados',
      'Padrão de login alinhado ao horário contratual'
    ],
    recommendations: [
      'Manter política atual de DLP',
      'Revisar trimestralmente'
    ],
    raw_data: { anomalies: 0, dlp_incidents: 0, unusual_logins: 0 },
    created_at: daysAgo(3)
  },
  {
    employee_name: 'Mariana Costa',
    report_type: 'behavior',
    summary: 'Mariana apresenta padrão consistente de multitarefa. Engajamento elevado em ferramentas de comunicação.',
    risk_score: 35,
    insights: [
      'Média de 22 trocas de contexto por hora',
      'Tempo médio de resposta em mensagens: 4min',
      'Participação ativa em 3 projetos paralelos'
    ],
    recommendations: [
      'Avaliar sobrecarga cognitiva',
      'Consolidar projetos onde possível',
      'Treinamento em gestão de tempo'
    ],
    raw_data: { context_switches_per_hour: 22, response_time_min: 4, projects: 3 },
    created_at: daysAgo(2)
  },
  {
    employee_name: 'Mariana Costa',
    report_type: 'summary',
    summary: 'Resumo executivo: profissional engajada, alta performance em entregas, mas com sinais iniciais de sobrecarga.',
    risk_score: 40,
    insights: [
      'Performance geral acima da média do time',
      'Qualidade do trabalho consistentemente alta',
      'Risco médio de burnout em 3 meses se ritmo continuar'
    ],
    recommendations: [
      'Conversa 1:1 com gestor sobre carga',
      'Avaliar redistribuição de tarefas',
      'Programa de bem-estar'
    ],
    raw_data: { performance_percentile: 88, burnout_risk: 'medium' },
    created_at: daysAgo(5)
  },
  {
    employee_name: 'Roberto Almeida',
    report_type: 'productivity',
    summary: 'Roberto demonstrou queda de 15% na produtividade nos últimos 14 dias. Necessária investigação.',
    risk_score: 58,
    insights: [
      'Tempo ativo caiu de 7.8h para 6.6h por dia',
      'Aumento de 30% em tempo ocioso',
      'Aumento em navegação não relacionada ao trabalho'
    ],
    recommendations: [
      'Conversa individual para entender causas',
      'Avaliar ambiente de trabalho',
      'Possível treinamento ou reengajamento'
    ],
    raw_data: { avg_active_hours: 6.6, idle_pct: 28, trend: 'declining' },
    created_at: daysAgo(1)
  },
  {
    employee_name: 'Roberto Almeida',
    report_type: 'risk',
    summary: 'Risco médio-alto. Detectadas tentativas de acesso a arquivos confidenciais fora do escopo do projeto.',
    risk_score: 72,
    insights: [
      '5 acessos a pastas restritas em 30 dias',
      '3 downloads de arquivos confidenciais sem justificativa',
      'Padrão fora do horário comercial em 2 ocasiões'
    ],
    recommendations: [
      'Revisão de permissões urgentes',
      'Auditoria de logs de DLP',
      'Conversa formal sobre conduta'
    ],
    raw_data: { restricted_access: 5, dlp_incidents: 3, off_hours_logins: 2 },
    created_at: daysAgo(4)
  },
  {
    employee_name: 'Juliana Pereira',
    report_type: 'behavior',
    summary: 'Juliana mantém excelente disciplina de trabalho. Foco profundo em tarefas técnicas, baixa interrupção.',
    risk_score: 12,
    insights: [
      'Sessões de foco profundo de 2-3 horas',
      'Mínimo de distrações digitais',
      'Organização exemplar de tarefas'
    ],
    recommendations: [
      'Reconhecimento interno',
      'Considerar mentoria para novos funcionários',
      'Compartilhar boas práticas no time'
    ],
    raw_data: { deep_work_sessions: 4, distraction_index: 0.08, task_completion: 0.95 },
    created_at: daysAgo(2)
  },
  {
    employee_name: 'Fernando Santos',
    report_type: 'productivity',
    summary: 'Fernando mantém boa produtividade. Tendência de alta nos últimos 7 dias.',
    risk_score: 25,
    insights: [
      'Aumento de 12% em entregas concluídas',
      'Tempo médio por tarefa reduzido em 18%',
      'Colaboração ativa em code reviews'
    ],
    recommendations: [
      'Reconhecer melhoria contínua',
      'Avaliar promoção ou reajuste',
      'Manter ritmo atual'
    ],
    raw_data: { avg_active_hours: 7.5, trend: 'increasing', tasks_completed: 42 },
    created_at: daysAgo(6)
  },
  {
    employee_name: 'Fernando Santos',
    report_type: 'summary',
    summary: 'Resumo trimestral: profissional em ascensão, alta performance, candidato natural a posições de liderança.',
    risk_score: 20,
    insights: [
      'Performance consistente ao longo do trimestre',
      'Liderança informal em projetos',
      'Mentoria espontânea de colegas'
    ],
    recommendations: [
      'Plano de carreira estruturado',
      'Treinamento em gestão de pessoas',
      'Considerar tech-lead'
    ],
    raw_data: { quarterly_score: 92, leadership_signals: 8 },
    created_at: daysAgo(10)
  },
  {
    employee_name: 'Patrícia Lima',
    report_type: 'risk',
    summary: 'Risco baixo. Patrícia opera dentro dos padrões esperados. Nenhuma anomalia detectada.',
    risk_score: 15,
    insights: [
      'Acessos alinhados ao escopo do projeto',
      'Comunicação padrão em canais oficiais',
      'Horários consistentes com a política'
    ],
    recommendations: [
      'Manter política atual',
      'Revisão semestral padrão'
    ],
    raw_data: { anomalies: 0, dlp_incidents: 0, compliance_score: 0.98 },
    created_at: daysAgo(7)
  },
  {
    employee_name: 'Aline Souza',
    report_type: 'behavior',
    summary: 'Aline apresenta sinais de engajamento decrescente. Aumento de 40% em pausas longas.',
    risk_score: 48,
    insights: [
      'Pausas longas (>30min) aumentaram 40%',
      'Tempo de resposta em comunicação dobrou',
      'Redução de participação em reuniões'
    ],
    recommendations: [
      'Conversa 1:1 com gestor',
      'Investigar possíveis insatisfações',
      'Possível revisão de responsabilidades'
    ],
    raw_data: { long_breaks_increase: 0.40, response_time_increase: 1.0, meeting_attendance: 0.65 },
    created_at: daysAgo(3)
  },
  {
    employee_name: 'Aline Souza',
    report_type: 'summary',
    summary: 'Resumo mensal: sinais de desengajamento inicial requerem intervenção proativa.',
    risk_score: 55,
    insights: [
      'Produtividade caiu 22% no mês',
      'Score de satisfação estimado em 4.2/10',
      'Risco de saída em 6 meses: médio'
    ],
    recommendations: [
      'Programa de reengajamento',
      'Revisão de fit cultural',
      'Acompanhamento quinzenal'
    ],
    raw_data: { productivity_change: -0.22, satisfaction_estimate: 4.2, attrition_risk: 'medium' },
    created_at: daysAgo(8)
  }
];

(async () => {
  console.log(`Inserting ${rows.length} ai_analysis_reports...`);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/ai_analysis_reports`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(rows)
  });
  if (!res.ok) {
    console.error('Insert failed:', res.status, await res.text());
    process.exit(1);
  }
  const inserted = await res.json();
  console.log(`Inserted ${inserted.length} rows.`);
  // Verify count
  const countRes = await fetch(`${SUPABASE_URL}/rest/v1/ai_analysis_reports?select=id`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Prefer': 'count=exact' }
  });
  const cr = countRes.headers.get('content-range');
  console.log('Total in table:', cr);
})();