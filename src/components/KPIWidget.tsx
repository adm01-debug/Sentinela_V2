import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { KPISparkline, type SparklineData } from './kpi/KPISparkline';
import { KPIProgressRing } from './kpi/KPIProgressRing';

// Re-export sub-components
export { KPISparkline, type SparklineData } from './kpi/KPISparkline';
export { KPIProgressRing } from './kpi/KPIProgressRing';

interface KPIWidgetProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  changeLabel?: string;
  target?: number;
  targetLabel?: string;
  icon?: LucideIcon;
  iconColor?: string;
  sparklineData?: SparklineData[];
  format?: 'number' | 'currency' | 'percent' | 'duration';
  variant?: 'default' | 'compact' | 'detailed';
  isLoading?: boolean;
  className?: string;
}

function KPIWidgetComponent({
  title, value, previousValue, change, changeLabel = 'vs período anterior',
  target, targetLabel = 'Meta', icon: Icon, iconColor = 'text-primary',
  sparklineData, format = 'number', variant = 'default', isLoading = false, className,
}: KPIWidgetProps) {
  const calculatedChange = useMemo(() => {
    if (change !== undefined) return change;
    if (previousValue !== undefined && typeof value === 'number' && typeof previousValue === 'number') {
      return previousValue !== 0 ? Math.round(((value - previousValue) / previousValue) * 100) : 0;
    }
    return undefined;
  }, [change, value, previousValue]);

  const isPositive = calculatedChange !== undefined && calculatedChange > 0;
  const isNegative = calculatedChange !== undefined && calculatedChange < 0;
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const trendColor = isPositive ? 'text-success' : isNegative ? 'text-destructive' : 'text-muted-foreground';

  const formattedValue = useMemo(() => {
    if (typeof value === 'string') return value;
    switch (format) {
      case 'currency': return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
      case 'percent': return `${value.toFixed(1)}%`;
      case 'duration': const hours = Math.floor(value / 60); const mins = value % 60; return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
      default: return value.toLocaleString('pt-BR');
    }
  }, [value, format]);

  const targetProgress = useMemo(() => {
    if (target === undefined || typeof value !== 'number') return undefined;
    return (value / target) * 100;
  }, [value, target]);

  if (isLoading) {
    return (
      <Card className={cn('p-5', className)}>
        <div className="flex items-start justify-between"><div className="flex-1 space-y-3"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-20" /></div><Skeleton className="h-10 w-10 rounded-xl" /></div>
        {variant === 'detailed' && <Skeleton className="h-10 w-full mt-4" />}
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={cn('p-4 hover-lift', className)}>
        <div className="flex items-center gap-3">
          {Icon && <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-muted/50"><Icon className={cn('h-5 w-5', iconColor)} /></div>}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold">{formattedValue}</span>
              {calculatedChange !== undefined && <span className={cn('text-xs font-medium flex items-center gap-0.5', trendColor)}><TrendIcon className="h-3 w-3" />{Math.abs(calculatedChange)}%</span>}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('p-5 hover-lift overflow-hidden', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold tracking-tight">{formattedValue}</span>
            {target !== undefined && (
              <Tooltip><TooltipTrigger><span className="text-xs text-muted-foreground">/ {typeof target === 'number' ? target.toLocaleString('pt-BR') : target}</span></TooltipTrigger><TooltipContent>{targetLabel}</TooltipContent></Tooltip>
            )}
          </div>
          {calculatedChange !== undefined && (
            <div className="flex items-center gap-2 mt-2">
              <span className={cn('inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium', isPositive && 'bg-success/10 text-success', isNegative && 'bg-destructive/10 text-destructive', !isPositive && !isNegative && 'bg-muted text-muted-foreground')}>
                <TrendIcon className="h-3 w-3" />{calculatedChange > 0 ? '+' : ''}{calculatedChange}%
              </span>
              <span className="text-xs text-muted-foreground">{changeLabel}</span>
            </div>
          )}
        </div>
        {targetProgress !== undefined ? (
          <KPIProgressRing value={targetProgress} size={48} strokeWidth={5} color={targetProgress >= 100 ? 'hsl(var(--success))' : targetProgress >= 70 ? 'hsl(var(--primary))' : 'hsl(var(--warning))'} />
        ) : Icon ? (
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-muted/50"><Icon className={cn('h-6 w-6', iconColor)} /></div>
        ) : null}
      </div>
      {sparklineData && sparklineData.length > 1 && (
        <div className="mt-4 -mx-5 -mb-5 px-5 pb-2 pt-2 bg-muted/30">
          <KPISparkline data={sparklineData} height={40} color={calculatedChange !== undefined && calculatedChange < 0 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} />
        </div>
      )}
      {variant === 'detailed' && previousValue !== undefined && (
        <div className="mt-4 pt-4 border-t border-border/50 flex justify-between text-xs text-muted-foreground">
          <span>Período anterior</span>
          <span className="font-medium">{typeof previousValue === 'number' ? previousValue.toLocaleString('pt-BR') : previousValue}</span>
        </div>
      )}
    </Card>
  );
}

export const KPIWidget = memo(KPIWidgetComponent);

interface KPIGridProps { children: React.ReactNode; columns?: 2 | 3 | 4 | 5; className?: string; }

function KPIGridComponent({ children, columns = 4, className }: KPIGridProps) {
  const gridCols = { 2: 'grid-cols-1 sm:grid-cols-2', 3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', 4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4', 5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5' };
  return <div className={cn('grid gap-4', gridCols[columns], className)}>{children}</div>;
}

export const KPIGrid = memo(KPIGridComponent);
