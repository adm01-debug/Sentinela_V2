import React from 'react';
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

export const SecurityScore: React.FC<SecurityScoreProps> = ({
  score,
  label = 'Security Score',
  showDetails = true,
  className,
}) => {
  const getScoreColor = (s: number) => {
    if (s >= 80) return { color: 'text-success', bg: 'bg-success', label: 'Excellent' };
    if (s >= 60) return { color: 'text-info', bg: 'bg-info', label: 'Good' };
    if (s >= 40) return { color: 'text-warning', bg: 'bg-warning', label: 'Fair' };
    return { color: 'text-destructive', bg: 'bg-destructive', label: 'Critical' };
  };

  const scoreInfo = getScoreColor(score);

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <Shield className={cn('h-5 w-5', scoreInfo.color)} />
      </div>
      <div className="flex items-end gap-2 mb-4">
        <span className={cn('text-4xl font-bold', scoreInfo.color)}>{score}</span>
        <span className="text-lg text-muted-foreground mb-1">/100</span>
      </div>
      <Progress value={score} className="h-2 mb-2" />
      {showDetails && (
        <div className="flex items-center justify-between text-sm">
          <Badge variant={score >= 60 ? 'default' : 'destructive'}>{scoreInfo.label}</Badge>
          <span className="text-muted-foreground">Last updated: now</span>
        </div>
      )}
    </Card>
  );
};
