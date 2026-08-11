import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Gauge } from 'lucide-react';
import { useMemo } from 'react';
import { useAppCategories } from '@/hooks/useAppCategories';

interface AppUsageInput {
  app: string;
  duration: number;
}

interface Props {
  usage: AppUsageInput[];
  idleSeconds?: number;
}

export function ProductivityScoreCard({ usage, idleSeconds = 0 }: Props) {
  const { byIdentifier } = useAppCategories();

  const score = useMemo(() => {
    let productive = 0;
    let unproductive = 0;
    let neutral = 0;
    for (const u of usage) {
      const cat = byIdentifier.get(u.app.toLowerCase())?.category ?? 'neutral';
      if (cat === 'productive') productive += u.duration;
      else if (cat === 'unproductive') unproductive += u.duration;
      else neutral += u.duration;
    }
    const total = productive + unproductive + neutral + idleSeconds;
    if (total === 0) return 0;
    // Peso: produtivo=1.0, neutro=0.5, ocioso=0, improdutivo=0
    return Math.round(((productive + neutral * 0.5) / total) * 100);
  }, [usage, byIdentifier, idleSeconds]);

  const label =
    score >= 80 ? 'Excelente' : score >= 60 ? 'Bom' : score >= 40 ? 'Regular' : 'Baixo';

  const scoreClass =
    score >= 80
      ? 'text-success'
      : score >= 60
      ? 'text-info'
      : score >= 40
      ? 'text-warning'
      : 'text-destructive';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Gauge className="h-5 w-5 text-primary" />
          Score de Produtividade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between mb-3">
          <span className={`text-5xl font-bold ${scoreClass}`}>{score}</span>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <Progress value={score} className="h-2" aria-label={`Score: ${score} de 100`} />
        <p className="mt-2 text-xs text-muted-foreground">
          Baseado em % de tempo produtivo vs. ocioso e improdutivo.
        </p>
      </CardContent>
    </Card>
  );
}
