import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ThreatLevelBadge, type ThreatLevel } from './ThreatLevelBadge';

interface RiskItem {
  id: string;
  label: string;
  level: ThreatLevel;
  description: string;
}

interface RiskAssessmentProps {
  risks: RiskItem[];
  className?: string;
}

const LEVEL_ORDER: Record<ThreatLevel, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  none: 4,
};

export const RiskAssessment: React.FC<RiskAssessmentProps> = ({ risks, className }) => {
  const sortedRisks = useMemo(
    () => [...risks].sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]),
    [risks],
  );

  if (sortedRisks.length === 0) {
    return (
      <p className={cn('text-sm text-muted-foreground', className)}>
        Nenhum risco identificado.
      </p>
    );
  }

  return (
    <ul
      className={cn('space-y-3 list-none', className)}
      aria-label="Avaliação de riscos"
    >
      {sortedRisks.map((risk) => (
        <li
          key={risk.id}
          className="flex items-start gap-3 p-3 rounded-lg border bg-card"
        >
          <ThreatLevelBadge level={risk.level} className="shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium">{risk.label}</p>
            <p className="text-sm text-muted-foreground">{risk.description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
};
