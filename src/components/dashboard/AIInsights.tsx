import { useMemo } from 'react';
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AIInsightsProps {
  totalEmployees: number;
  activeEmployees: number;
  productivity: number;
  alertsCount: number;
}

type InsightTone = 'positive' | 'warning' | 'negative' | 'neutral';

interface Insight {
  id: string;
  title: string;
  detail: string;
  tone: InsightTone;
}

const TONE_STYLES: Record<InsightTone, { icon: typeof TrendingUp; className: string; label: string }> = {
  positive: { icon: TrendingUp, className: 'text-success bg-success/10', label: 'Positivo' },
  warning: { icon: AlertTriangle, className: 'text-warning bg-warning/10', label: 'Atenção' },
  negative: { icon: TrendingDown, className: 'text-destructive bg-destructive/10', label: 'Crítico' },
  neutral: { icon: Info, className: 'text-info bg-info/10', label: 'Informativo' },
};

/**
 * P4 — Insights AI.
 * Deterministic, rule-based insights generated from current KPIs.
 * Uses semantic heuristics: activation ratio, productivity band, alert pressure.
 * Runs client-side (no round trip); memoized on input.
 */
export function AIInsights({ totalEmployees, activeEmployees, productivity, alertsCount }: AIInsightsProps) {
  const insights = useMemo<Insight[]>(() => {
    const list: Insight[] = [];
    const activationRate = totalEmployees > 0 ? (activeEmployees / totalEmployees) * 100 : 0;

    if (activationRate >= 40) {
      list.push({
        id: 'activation-high',
        title: `Alta ativação: ${activationRate.toFixed(0)}% online agora`,
        detail: `${activeEmployees} de ${totalEmployees} colaboradores estão ativos — indicador saudável de engajamento em tempo real.`,
        tone: 'positive',
      });
    } else if (activationRate < 20 && totalEmployees > 10) {
      list.push({
        id: 'activation-low',
        title: `Ativação baixa: apenas ${activationRate.toFixed(0)}% online`,
        detail: 'Considere verificar horário de expediente e conectividade dos agentes desktop.',
        tone: 'warning',
      });
    }

    if (productivity >= 85) {
      list.push({
        id: 'productivity-strong',
        title: `Produtividade forte em ${productivity}%`,
        detail: 'Mantém-se acima da média de mercado (78%). Padrões atuais devem ser preservados.',
        tone: 'positive',
      });
    } else if (productivity < 65) {
      list.push({
        id: 'productivity-weak',
        title: `Produtividade abaixo do alvo (${productivity}%)`,
        detail: 'Investigue distrações recorrentes e revise metas de tempo focado nos times mais afetados.',
        tone: 'negative',
      });
    } else {
      list.push({
        id: 'productivity-mid',
        title: `Produtividade estável em ${productivity}%`,
        detail: 'Pequenos ajustes em horários de reuniões podem elevar a taxa em 5-8 pontos.',
        tone: 'neutral',
      });
    }

    if (alertsCount === 0) {
      list.push({
        id: 'alerts-clear',
        title: 'Sem alertas ativos',
        detail: 'Ambiente estável nas últimas 24h. Bom momento para revisar políticas de DLP.',
        tone: 'positive',
      });
    } else if (alertsCount >= 10) {
      list.push({
        id: 'alerts-heavy',
        title: `${alertsCount} alertas exigem triagem`,
        detail: 'Volume elevado — priorize incidentes de severidade alta antes das próximas 2h.',
        tone: 'negative',
      });
    } else {
      list.push({
        id: 'alerts-normal',
        title: `${alertsCount} alertas em aberto`,
        detail: 'Volume dentro do esperado. Recomenda-se resolução em até 4h para manter SLA.',
        tone: 'warning',
      });
    }

    return list.slice(0, 3);
  }, [totalEmployees, activeEmployees, productivity, alertsCount]);

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
          </span>
          Insights inteligentes
        </CardTitle>
        <Badge variant="outline" className="text-xs">Automático</Badge>
      </CardHeader>
      <CardContent>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-3" role="list">
          {insights.map((insight) => {
            const style = TONE_STYLES[insight.tone];
            const Icon = style.icon;
            return (
              <li
                key={insight.id}
                className="rounded-lg border p-4 bg-card hover:bg-accent/30 motion-safe:transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${style.className}`}
                    aria-label={style.label}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">{insight.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{insight.detail}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
