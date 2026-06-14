import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export type ThreatLevel = 'critical' | 'high' | 'medium' | 'low' | 'none';

interface ThreatLevelBadgeProps {
  level: ThreatLevel;
  showIcon?: boolean;
  className?: string;
}

const threatConfig: Record<ThreatLevel, {
  icon: typeof ShieldCheck;
  label: string;
  variant: 'destructive' | 'secondary' | 'default' | 'outline';
  className: string;
}> = {
  critical: { icon: ShieldX, label: 'Critical', variant: 'destructive', className: 'animate-pulse' },
  high: { icon: ShieldAlert, label: 'High', variant: 'destructive', className: '' },
  medium: { icon: AlertTriangle, label: 'Medium', variant: 'secondary', className: 'bg-warning text-warning-foreground' },
  low: { icon: Info, label: 'Low', variant: 'secondary', className: 'bg-info/10 text-info' },
  none: { icon: ShieldCheck, label: 'None', variant: 'outline', className: 'bg-success/10 text-success' },
};

export const ThreatLevelBadge: React.FC<ThreatLevelBadgeProps> = ({
  level,
  showIcon = true,
  className,
}) => {
  const config = threatConfig[level];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  );
};
