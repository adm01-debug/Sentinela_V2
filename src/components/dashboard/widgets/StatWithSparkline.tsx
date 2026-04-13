import { memo, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Sparkline } from './Sparkline';

export interface StatWithSparklineProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  data: number[];
  icon?: ReactNode;
  className?: string;
}

function StatWithSparklineComponent({ title, value, change, trend = 'neutral', data, icon, className }: StatWithSparklineProps) {
  const getTrendColor = () => { if (trend === 'up') return 'text-success'; if (trend === 'down') return 'text-destructive'; return 'text-muted-foreground'; };
  const sparklineColor = trend === 'up' ? 'success' : trend === 'down' ? 'destructive' : 'primary';

  return (
    <div className={cn('bg-card border rounded-xl p-4', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{value}</span>
            {change !== undefined && <span className={cn('text-sm font-medium', getTrendColor())}>{change > 0 ? '+' : ''}{change}%</span>}
          </div>
        </div>
        {icon && <div className="p-2 bg-muted rounded-lg">{icon}</div>}
      </div>
      <div className="mt-3"><Sparkline data={data} color={sparklineColor} height={32} /></div>
    </div>
  );
}

export const StatWithSparkline = memo(StatWithSparklineComponent);
