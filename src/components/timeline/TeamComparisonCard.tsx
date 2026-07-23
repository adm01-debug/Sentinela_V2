import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/Skeleton';
import { ArrowDown, ArrowUp, Minus, Users } from 'lucide-react';

interface Props {
  employeeScore: number;
  teamAverageScore: number;
  sampleSize: number;
  isLoading?: boolean;
}

export function TeamComparisonCard({ employeeScore, teamAverageScore, sampleSize, isLoading }: Props) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Comparativo com a equipe</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const diff = employeeScore - teamAverageScore;
  const absDiff = Math.abs(diff);
  const Icon = diff > 2 ? ArrowUp : diff < -2 ? ArrowDown : Minus;
  const tone =
    diff > 2 ? 'text-success' : diff < -2 ? 'text-destructive' : 'text-muted-foreground';
  const label =
    diff > 2
      ? `${absDiff} pts acima da média`
      : diff < -2
        ? `${absDiff} pts abaixo da média`
        : 'Alinhado com a média da equipe';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          Comparativo com a equipe
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sampleSize === 0 ? (
          <div className="text-sm text-muted-foreground">Sem dados suficientes da equipe neste dia.</div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Colaborador</div>
                <div className="text-2xl font-bold text-foreground">{employeeScore}%</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Média equipe ({sampleSize})</div>
                <div className="text-2xl font-bold text-muted-foreground">{teamAverageScore}%</div>
              </div>
            </div>
            <div className={`flex items-center gap-2 text-sm font-medium ${tone}`}>
              <Icon className="h-4 w-4" />
              {label}
            </div>
            {/* Barra dupla */}
            <div className="space-y-1">
              <div className="h-2 rounded bg-muted">
                <div
                  className="h-2 rounded bg-primary transition-all"
                  style={{ width: `${Math.min(100, employeeScore)}%` }}
                />
              </div>
              <div className="h-2 rounded bg-muted">
                <div
                  className="h-2 rounded bg-muted-foreground/60 transition-all"
                  style={{ width: `${Math.min(100, teamAverageScore)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
