import { cn } from '@/lib/utils';
import { getLevelMeta, levelFromScore, type RiskLevel } from '@/lib/uebaLevels';
import { Shield, ShieldAlert, ShieldX, ShieldCheck } from 'lucide-react';

interface RiskScoreBadgeProps {
  score: number;
  level?: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  className?: string;
}

const ICONS: Record<RiskLevel, typeof Shield> = {
  low: ShieldCheck,
  medium: Shield,
  high: ShieldAlert,
  critical: ShieldX,
};

export function RiskScoreBadge({ score, level, size = 'md', showScore = true, className }: RiskScoreBadgeProps) {
  const lvl = level || levelFromScore(score);
  const meta = getLevelMeta(lvl);
  const Icon = ICONS[lvl];

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-sm px-2 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };
  const iconSize = { sm: 'h-3 w-3', md: 'h-3.5 w-3.5', lg: 'h-4 w-4' }[size];

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border font-medium',
        meta.colorClass,
        meta.bgClass,
        meta.borderClass,
        sizeClasses[size],
        className
      )}
      title={`Risk: ${meta.label} (${score})`}
    >
      <Icon className={iconSize} aria-hidden />
      {showScore && <span className="tabular-nums">{score}</span>}
      <span className="capitalize">{meta.label}</span>
    </div>
  );
}
