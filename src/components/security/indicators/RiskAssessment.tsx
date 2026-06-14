import React from 'react';
import { ThreatLevelBadge, type ThreatLevel } from './ThreatLevelBadge';
import { cn } from '@/lib/utils';

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

export const RiskAssessment: React.FC<RiskAssessmentProps> = ({
  risks,
  className,
}) => {
  const sortedRisks = [...risks].sort((a, b) => {
    const order: Record<ThreatLevel, number> = { critical: 0, high: 1, medium: 2, low: 3, none: 4 };
    return order[a.level] - order[b.level];
  });

  return (
    <div className={cn('space-y-3', className)}>
      {sortedRisks.map((risk) => (
        <div key={risk.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
          <ThreatLevelBadge level={risk.level} />
          <div className="flex-1 min-w-0">
            <p className="font-medium">{risk.label}</p>
            <p className="text-sm text-muted-foreground">{risk.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
