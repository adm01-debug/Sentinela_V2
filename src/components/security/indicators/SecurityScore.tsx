import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface SecurityScoreProps {
  score: number;
  label?: string;
  showDetails?: boolean;
  className?: string;
}

interface ScoreInfo {
  color: string;
  bg: string;
  label: string;
}

const getScoreInfo = (s: number): ScoreInfo => {
  if (s >= 80) return { color: 'text-success', bg: 'bg-success', label: 'Excelente' };
  if (s >= 60) return { color: 'text-primary', bg: 'bg-primary', label: 'Bom' };
  if (s >= 40) return { color: 'text-warning', bg: 'bg-warning', label: 'Razoável' };
  return { color: 'text-destructive', bg: 'bg-destructive', label: 'Crítico' };
};

export const SecurityScore: React.FC<SecurityScoreProps> = ({
  score,
  label = 'Pontuação de Segurança',
  showDetails = true,
  className,
}) => {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));
  const scoreInfo = useMemo(() => getScoreInfo(safeScore), [safeScore]);

  return (
    <Card
      className={cn('p-6', className)}
      role="status"
      aria-label={`${label}: ${safeScore} de 100 — ${scoreInfo.label}`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <Shield className={cn('h-5 w-5', scoreInfo.color)} aria-hidden="true" />
      </div>
      <div className="flex items-end gap-2 mb-4">
        <span className={cn('text-4xl font-bold tabular-nums', scoreInfo.color)}>
          {safeScore}
        </span>
        <span className="text-lg text-muted-foreground mb-1">/100</span>
      </div>
      <Progress
        value={safeScore}
        className="h-2 mb-2"
        aria-label={`${safeScore} por cento`}
      />
      {showDetails && (
        <div className="flex items-center justify-between text-sm">
          <Badge variant={safeScore >= 60 ? 'default' : 'destructive'}>
            {scoreInfo.label}
          </Badge>
          <span className="text-muted-foreground">Atualizado agora</span>
        </div>
      )}
    </Card>
  );
};
