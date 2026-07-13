import React from 'react';
import { cn } from '@/lib/utils';
import { ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, Info, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type ThreatLevel = 'critical' | 'high' | 'medium' | 'low' | 'none';

interface ThreatLevelBadgeProps {
  level: ThreatLevel;
  showIcon?: boolean;
  className?: string;
}

interface ThreatConfig {
  icon: LucideIcon;
  label: string;
  variant: 'destructive' | 'secondary' | 'default' | 'outline';
  className: string;
  ariaLabel: string;
}

const THREAT_CONFIG: Record<ThreatLevel, ThreatConfig> = {
  critical: {
    icon: ShieldX,
    label: 'Crítico',
    variant: 'destructive',
    className: 'animate-pulse',
    ariaLabel: 'Nível de ameaça crítico',
  },
  high: {
    icon: ShieldAlert,
    label: 'Alto',
    variant: 'destructive',
    className: '',
    ariaLabel: 'Nível de ameaça alto',
  },
  medium: {
    icon: AlertTriangle,
    label: 'Médio',
    variant: 'secondary',
    className: 'bg-warning/15 text-warning border-warning/20',
    ariaLabel: 'Nível de ameaça médio',
  },
  low: {
    icon: Info,
    label: 'Baixo',
    variant: 'secondary',
    className: 'bg-primary/15 text-primary border-primary/20',
    ariaLabel: 'Nível de ameaça baixo',
  },
  none: {
    icon: ShieldCheck,
    label: 'Nenhuma',
    variant: 'outline',
    className: 'bg-success/15 text-success border-success/20',
    ariaLabel: 'Sem ameaças detectadas',
  },
};

export const ThreatLevelBadge: React.FC<ThreatLevelBadgeProps> = ({
  level,
  showIcon = true,
  className,
}) => {
  const config = THREAT_CONFIG[level];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
      aria-label={config.ariaLabel}
    >
      {showIcon && <Icon className="h-3 w-3 mr-1" aria-hidden="true" />}
      {config.label}
    </Badge>
  );
};
