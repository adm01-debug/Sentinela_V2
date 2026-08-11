import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type InsightSeverity = 'positive' | 'warning' | 'critical' | 'info';

export interface ProductivityInsight {
  id: string;
  severity: InsightSeverity;
  title: string;
  description: string;
  recommendation: string;
  employeeName?: string;
  metric?: string;
}

export interface EmployeeWoW {
  employeeName: string;
  currentScore: number;
  previousScore: number;
  diffPoints: number;
  currentProductiveSeconds: number;
  previousProductiveSeconds: number;
  currentActiveDays: number;
}

export interface WeeklyInsightsResult {
  insights: ProductivityInsight[];
  summary: string;
  teamCurrentScore: number;
  teamPreviousScore: number;
  teamDiffPoints: number;
  employees: EmployeeWoW[];
}

interface Row {
  employee_name: string | null;
  recorded_date: string;
  productive_time_seconds: number | null;
  neutral_time_seconds: number | null;
  unproductive_time_seconds: number | null;
}

function isoDate(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
}

function aggregatePerEmployee(rows: Row[]) {
  const map = new Map<string, { p: number; n: number; u: number; days: Set<string> }>();
  for (const r of rows) {
    if (!r.employee_name) continue;
    const cur = map.get(r.employee_name) ?? { p: 0, n: 0, u: 0, days: new Set<string>() };
    cur.p += r.productive_time_seconds ?? 0;
    cur.n += r.neutral_time_seconds ?? 0;
    cur.u += r.unproductive_time_seconds ?? 0;
    cur.days.add(r.recorded_date);
    map.set(r.employee_name, cur);
  }
  return map;
}

function toScore(p: number, n: number, u: number): number {
  const total = p + n + u;
  return total > 0 ? Math.round((p / total) * 100) : 0;
}

/**
 * Gera insights automáticos e recomendações baseados no ranking semanal
 * comparando com a semana anterior (Week-over-Week).
 */
export function useWeeklyProductivityInsights(days = 7) {
  return useQuery({
    queryKey: ['weekly-productivity-insights', days],
    staleTime: 60_000,
    queryFn: async (): Promise<WeeklyInsightsResult> => {
      const currentStart = isoDate(days - 1);
      const currentEnd = isoDate(0);
      const previousStart = isoDate(days * 2 - 1);
      const previousEnd = isoDate(days);

      const [curRes, prevRes] = await Promise.all([
        supabase
          .from('productivity_logs')
          .select('employee_name, recorded_date, productive_time_seconds, neutral_time_seconds, unproductive_time_seconds')
          .gte('recorded_date', currentStart)
          .lte('recorded_date', currentEnd),
        supabase
          .from('productivity_logs')
          .select('employee_name, recorded_date, productive_time_seconds, neutral_time_seconds, unproductive_time_seconds')
          .gte('recorded_date', previousStart)
          .lte('recorded_date', previousEnd),
      ]);

      if (curRes.error) throw curRes.error;
      if (prevRes.error) throw prevRes.error;

      const cur = aggregatePerEmployee((curRes.data ?? []) as Row[]);
      const prev = aggregatePerEmployee((prevRes.data ?? []) as Row[]);

      const names = new Set<string>([...cur.keys(), ...prev.keys()]);
      const employees: EmployeeWoW[] = [];
      let teamP = 0, teamN = 0, teamU = 0;
      let teamPPrev = 0, teamNPrev = 0, teamUPrev = 0;

      for (const name of names) {
        const c = cur.get(name) ?? { p: 0, n: 0, u: 0, days: new Set<string>() };
        const p = prev.get(name) ?? { p: 0, n: 0, u: 0, days: new Set<string>() };
        teamP += c.p; teamN += c.n; teamU += c.u;
        teamPPrev += p.p; teamNPrev += p.n; teamUPrev += p.u;
        const curScore = toScore(c.p, c.n, c.u);
        const prevScore = toScore(p.p, p.n, p.u);
        employees.push({
          employeeName: name,
          currentScore: curScore,
          previousScore: prevScore,
          diffPoints: curScore - prevScore,
          currentProductiveSeconds: c.p,
          previousProductiveSeconds: p.p,
          currentActiveDays: c.days.size,
        });
      }

      employees.sort((a, b) => b.currentScore - a.currentScore);
      const teamCurrentScore = toScore(teamP, teamN, teamU);
      const teamPreviousScore = toScore(teamPPrev, teamNPrev, teamUPrev);
      const teamDiffPoints = teamCurrentScore - teamPreviousScore;

      const insights: ProductivityInsight[] = [];

      // 1. Team-level trend
      if (employees.length === 0) {
        insights.push({
          id: 'no-data',
          severity: 'info',
          title: 'Sem dados suficientes',
          description: 'Não há logs de produtividade no período selecionado.',
          recommendation: 'Verifique se o agente de monitoramento está ativo nos dispositivos.',
        });
      } else if (teamDiffPoints >= 5) {
        insights.push({
          id: 'team-up',
          severity: 'positive',
          title: `Equipe subiu ${teamDiffPoints} pts WoW`,
          description: `Score coletivo passou de ${teamPreviousScore}% para ${teamCurrentScore}%.`,
          recommendation: 'Reconheça publicamente os destaques e documente as práticas que geraram o ganho.',
          metric: `${teamPreviousScore}% → ${teamCurrentScore}%`,
        });
      } else if (teamDiffPoints <= -5) {
        insights.push({
          id: 'team-down',
          severity: 'critical',
          title: `Equipe caiu ${Math.abs(teamDiffPoints)} pts WoW`,
          description: `Score coletivo recuou de ${teamPreviousScore}% para ${teamCurrentScore}%.`,
          recommendation: 'Investigue mudanças recentes (novas ferramentas, reuniões, turnover) e alinhe metas em 1:1.',
          metric: `${teamPreviousScore}% → ${teamCurrentScore}%`,
        });
      } else {
        insights.push({
          id: 'team-stable',
          severity: 'info',
          title: 'Equipe estável',
          description: `Variação de ${teamDiffPoints >= 0 ? '+' : ''}${teamDiffPoints} pts em relação à semana anterior.`,
          recommendation: 'Mantenha ritmo e explore oportunidades para elevar o teto dos top performers.',
          metric: `${teamCurrentScore}%`,
        });
      }

      // 2. Top improver
      const improvers = employees
        .filter((e) => e.previousScore > 0 && e.diffPoints >= 5)
        .sort((a, b) => b.diffPoints - a.diffPoints);
      if (improvers[0]) {
        const top = improvers[0];
        insights.push({
          id: `improver-${top.employeeName}`,
          severity: 'positive',
          title: `${top.employeeName} evoluiu +${top.diffPoints} pts`,
          description: `Score subiu de ${top.previousScore}% para ${top.currentScore}%.`,
          recommendation: 'Convide para compartilhar rotina/ferramentas em cerimônia da equipe.',
          employeeName: top.employeeName,
          metric: `+${top.diffPoints} pts`,
        });
      }

      // 3. Biggest drop
      const droppers = employees
        .filter((e) => e.previousScore > 0 && e.diffPoints <= -5)
        .sort((a, b) => a.diffPoints - b.diffPoints);
      if (droppers[0]) {
        const drop = droppers[0];
        insights.push({
          id: `drop-${drop.employeeName}`,
          severity: 'warning',
          title: `${drop.employeeName} recuou ${Math.abs(drop.diffPoints)} pts`,
          description: `Score caiu de ${drop.previousScore}% para ${drop.currentScore}%.`,
          recommendation: 'Agende 1:1 para entender bloqueios (carga, ferramentas, saúde) e ajustar plano.',
          employeeName: drop.employeeName,
          metric: `${drop.previousScore}% → ${drop.currentScore}%`,
        });
      }

      // 4. Underperformers (score < 50%)
      const low = employees.filter((e) => e.currentScore < 50 && e.currentActiveDays >= Math.max(2, Math.floor(days / 2)));
      if (low.length > 0) {
        insights.push({
          id: 'low-performers',
          severity: low.length >= 3 ? 'critical' : 'warning',
          title: `${low.length} colaborador${low.length > 1 ? 'es' : ''} abaixo de 50%`,
          description: `Nomes: ${low.slice(0, 3).map((l) => l.employeeName).join(', ')}${low.length > 3 ? ` e +${low.length - 3}` : ''}.`,
          recommendation: 'Revise categorização de apps, distribua carga e considere trilha de foco/pomodoro.',
          metric: `${low.length} pessoa${low.length > 1 ? 's' : ''}`,
        });
      }

      // 5. High performers streak
      const high = employees.filter((e) => e.currentScore >= 80);
      if (high.length > 0) {
        insights.push({
          id: 'high-performers',
          severity: 'positive',
          title: `${high.length} destaque${high.length > 1 ? 's' : ''} acima de 80%`,
          description: `Top: ${high.slice(0, 3).map((h) => `${h.employeeName} (${h.currentScore}%)`).join(', ')}.`,
          recommendation: 'Considere promover como referências internas e envolver em mentoria dos demais.',
          metric: `${high.length}`,
        });
      }

      // 6. Engajamento (dias ativos baixos)
      const lowEngagement = employees.filter(
        (e) => e.currentActiveDays > 0 && e.currentActiveDays < Math.max(2, Math.floor(days * 0.4)),
      );
      if (lowEngagement.length > 0) {
        insights.push({
          id: 'low-engagement',
          severity: 'warning',
          title: `${lowEngagement.length} com baixo engajamento`,
          description: `Menos de ${Math.floor(days * 0.4)} dias ativos no período.`,
          recommendation: 'Confirme presença/afastamentos e valide se o agente está coletando dados corretamente.',
          metric: `${lowEngagement.length}`,
        });
      }

      const summary =
        employees.length === 0
          ? 'Sem base de comparação disponível.'
          : `Equipe com ${employees.length} colaborador${employees.length > 1 ? 'es' : ''} monitorado${employees.length > 1 ? 's' : ''}. Score atual ${teamCurrentScore}% (${teamDiffPoints >= 0 ? '+' : ''}${teamDiffPoints} pts WoW).`;

      return {
        insights,
        summary,
        teamCurrentScore,
        teamPreviousScore,
        teamDiffPoints,
        employees,
      };
    },
  });
}
