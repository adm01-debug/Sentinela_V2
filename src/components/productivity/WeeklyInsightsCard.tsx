import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/Skeleton';
import { AlertTriangle, CheckCircle2, Info, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import {
  useWeeklyProductivityInsights,
  type InsightSeverity,
  type ProductivityInsight,
} from '@/hooks/useWeeklyProductivityInsights';

interface Props {
  days?: number;
}

const SEVERITY_META: Record<
  InsightSeverity,
  { icon: typeof Info; iconClass: string; badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }
> = {
  positive: { icon: CheckCircle2, iconClass: 'text-success', badgeVariant: 'default', label: 'Positivo' },
  warning: { icon: TrendingDown, iconClass: 'text-warning', badgeVariant: 'secondary', label: 'Atenção' },
  critical: { icon: AlertTriangle, iconClass: 'text-destructive', badgeVariant: 'destructive', label: 'Crítico' },
  info: { icon: Info, iconClass: 'text-muted-foreground', badgeVariant: 'outline', label: 'Info' },
};

function InsightRow({ insight }: { insight: ProductivityInsight }) {
  const meta = SEVERITY_META[insight.severity];
  const Icon = meta.icon;
  return (
    <div className="flex gap-3 rounded-lg border border-border bg-card/50 p-4 transition-colors hover:bg-accent/40">
      <div className={`mt-0.5 shrink-0 ${meta.iconClass}`}>
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-sm font-semibold text-foreground">{insight.title}</h4>
          <Badge variant={meta.badgeVariant} className="text-[10px] uppercase tracking-wide">
            {meta.label}
          </Badge>
          {insight.metric && (
            <span className="text-xs font-medium text-muted-foreground">{insight.metric}</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{insight.description}</p>
        <p className="text-xs text-foreground/90">
          <span className="font-medium text-primary">Recomendação: </span>
          {insight.recommendation}
        </p>
      </div>
    </div>
  );
}

/**
 * Insights automáticos e recomendações baseadas no ranking semanal de produtividade
 * e nas variações Week-over-Week (WoW).
 */
export function WeeklyInsightsCard({ days = 7 }: Props) {
  const { data, isLoading } = useWeeklyProductivityInsights(days);

  const TrendIcon =
    !data || data.teamDiffPoints === 0
      ? Sparkles
      : data.teamDiffPoints > 0
        ? TrendingUp
        : TrendingDown;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" /> Insights automáticos
            </CardTitle>
            {data && (
              <p className="mt-1 text-xs text-muted-foreground">{data.summary}</p>
            )}
          </div>
          {data && (
            <div
              className={`flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium ${
                data.teamDiffPoints > 0
                  ? 'text-success'
                  : data.teamDiffPoints < 0
                    ? 'text-destructive'
                    : 'text-muted-foreground'
              }`}
            >
              <TrendIcon className="h-3.5 w-3.5" />
              {data.teamDiffPoints >= 0 ? '+' : ''}
              {data.teamDiffPoints} pts WoW
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading || !data ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : data.insights.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Nenhum insight relevante identificado no período.
          </div>
        ) : (
          <div className="space-y-3">
            {data.insights.map((i) => (
              <InsightRow key={i.id} insight={i} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
