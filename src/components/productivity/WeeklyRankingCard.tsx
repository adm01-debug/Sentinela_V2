import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/Skeleton';
import { Trophy, Medal, Award, Users } from 'lucide-react';
import { useWeeklyProductivityRanking } from '@/hooks/useWeeklyProductivityRanking';

interface Props {
  days?: number;
  limit?: number;
}

function formatHours(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}min`;
  return `${h}h ${m}min`;
}

function rankIcon(index: number) {
  if (index === 0) return <Trophy className="h-4 w-4 text-warning" aria-label="1º lugar" />;
  if (index === 1) return <Medal className="h-4 w-4 text-muted-foreground" aria-label="2º lugar" />;
  if (index === 2) return <Award className="h-4 w-4 text-warning/70" aria-label="3º lugar" />;
  return <span className="text-xs text-muted-foreground w-4 text-center">{index + 1}</span>;
}

export function WeeklyRankingCard({ days = 7, limit = 10 }: Props) {
  const { data, isLoading } = useWeeklyProductivityRanking(days);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-warning" /> Ranking semanal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const entries = (data?.entries ?? []).slice(0, limit);
  const teamAvg = data?.teamAverageScore ?? 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-warning" /> Ranking semanal
          </CardTitle>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" /> Média da equipe: <span className="font-semibold text-foreground">{teamAvg}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Sem dados de produtividade nos últimos {days} dias.
          </div>
        ) : (
          <ol className="space-y-3">
            {entries.map((e, i) => {
              const aboveAvg = e.score >= teamAvg;
              return (
                <li key={e.employeeName} className="flex items-center gap-3">
                  <div className="w-6 flex justify-center">{rankIcon(i)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium text-foreground">{e.employeeName}</span>
                      <span className={`text-sm font-semibold ${aboveAvg ? 'text-success' : 'text-muted-foreground'}`}>
                        {e.score}%
                      </span>
                    </div>
                    <Progress value={e.score} className="h-1.5 mt-1" />
                    <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{formatHours(e.productiveSeconds)} produtivos</span>
                      <span>{e.activeDays} {e.activeDays === 1 ? 'dia ativo' : 'dias ativos'}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
