import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/Skeleton';
import { ArrowDown, ArrowUp, Minus, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  days?: number;
}

interface WoWResult {
  currentScore: number;
  previousScore: number;
  currentProductiveSeconds: number;
  previousProductiveSeconds: number;
  diffPoints: number;
  hasPrevious: boolean;
}

function isoDate(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
}

/**
 * Semana atual vs. semana anterior — variação do score de produtividade
 * e do tempo produtivo agregados na empresa.
 */
export function WeeklyTrendCard({ days = 7 }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['weekly-trend-wow', days],
    staleTime: 60_000,
    queryFn: async (): Promise<WoWResult> => {
      const currentStart = isoDate(days - 1);
      const currentEnd = isoDate(0);
      const previousStart = isoDate(days * 2 - 1);
      const previousEnd = isoDate(days);

      const [curRes, prevRes] = await Promise.all([
        supabase
          .from('productivity_logs')
          .select('productive_time_seconds, neutral_time_seconds, unproductive_time_seconds')
          .gte('recorded_date', currentStart)
          .lte('recorded_date', currentEnd),
        supabase
          .from('productivity_logs')
          .select('productive_time_seconds, neutral_time_seconds, unproductive_time_seconds')
          .gte('recorded_date', previousStart)
          .lte('recorded_date', previousEnd),
      ]);
      if (curRes.error) throw curRes.error;
      if (prevRes.error) throw prevRes.error;

      const agg = (rows: Array<{
        productive_time_seconds: number | null;
        neutral_time_seconds: number | null;
        unproductive_time_seconds: number | null;
      }>) => {
        let p = 0, n = 0, u = 0;
        for (const r of rows) {
          p += r.productive_time_seconds ?? 0;
          n += r.neutral_time_seconds ?? 0;
          u += r.unproductive_time_seconds ?? 0;
        }
        const total = p + n + u;
        const score = total > 0 ? Math.round((p / total) * 100) : 0;
        return { p, score };
      };
      const cur = agg(curRes.data ?? []);
      const prev = agg(prevRes.data ?? []);
      return {
        currentScore: cur.score,
        previousScore: prev.score,
        currentProductiveSeconds: cur.p,
        previousProductiveSeconds: prev.p,
        diffPoints: cur.score - prev.score,
        hasPrevious: (prevRes.data ?? []).length > 0,
      };
    },
  });

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-primary" /> Tendência semanal
          </CardTitle>
        </CardHeader>
        <CardContent><Skeleton className="h-20 w-full" /></CardContent>
      </Card>
    );
  }

  const diff = data.diffPoints;
  const abs = Math.abs(diff);
  const Icon = diff > 1 ? ArrowUp : diff < -1 ? ArrowDown : Minus;
  const tone = diff > 1 ? 'text-success' : diff < -1 ? 'text-destructive' : 'text-muted-foreground';
  const rangeLabel = `Últimos ${days}d vs ${days}d anteriores`;
  const productiveDelta = data.currentProductiveSeconds - data.previousProductiveSeconds;
  const productiveDeltaMin = Math.round(productiveDelta / 60);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4 text-primary" /> Tendência semanal
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!data.hasPrevious ? (
          <div className="text-sm text-muted-foreground">
            Sem dados suficientes na janela anterior para comparação.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Score atual</div>
                <div className="text-3xl font-bold text-foreground">{data.currentScore}%</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Período anterior</div>
                <div className="text-2xl font-bold text-muted-foreground">{data.previousScore}%</div>
              </div>
            </div>
            <div className={`flex items-center gap-2 text-sm font-medium ${tone}`}>
              <Icon className="h-4 w-4" />
              {diff === 0
                ? 'Sem variação relevante'
                : `${diff > 0 ? '+' : '−'}${abs} pts ${diff > 0 ? 'acima' : 'abaixo'} do período anterior`}
            </div>
            <div className="text-xs text-muted-foreground flex justify-between">
              <span>{rangeLabel}</span>
              <span>
                Tempo produtivo:{' '}
                <span className={productiveDelta >= 0 ? 'text-success' : 'text-destructive'}>
                  {productiveDelta >= 0 ? '+' : ''}
                  {productiveDeltaMin} min
                </span>
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
