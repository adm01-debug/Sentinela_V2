import { memo, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ============================================================
// TYPES
// ============================================================

interface SparklineData {
  value: number;
  label?: string;
}

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

// ============================================================
// SPARKLINE COMPONENT
// ============================================================

interface SparklineProps {
  data: SparklineData[];
  height?: number;
  color?: string;
  showArea?: boolean;
  className?: string;
}

const Sparkline = memo(function Sparkline({
  data,
  height = 40,
  color = 'hsl(var(--primary))',
  showArea = true,
  className,
}: SparklineProps) {
  const { path, areaPath } = useMemo(() => {
    if (!data || data.length < 2) return { path: '', areaPath: '', points: [] };

    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const width = 100;
    const padding = 2;
    const effectiveHeight = height - padding * 2;

    const pointsList = data.map((d, i) => ({
      x: (i / (data.length - 1)) * width,
      y: padding + effectiveHeight - ((d.value - min) / range) * effectiveHeight,
      value: d.value,
      label: d.label,
    }));

    const linePath = pointsList
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    const area = `${linePath} L ${width} ${height} L 0 ${height} Z`;

    return { path: linePath, areaPath: area, points: pointsList };
  }, [data, height]);

  if (!data || data.length < 2) return null;

  return (
    <svg
      className={cn('w-full', className)}
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
    >
      {showArea && (
        <path
          d={areaPath}
          fill={`url(#sparkline-gradient-${color.replace(/[^a-zA-Z0-9]/g, '')})`}
          opacity={0.2}
        />
      )}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-300"
      />
      {/* Gradient definition */}
      <defs>
        <linearGradient
          id={`sparkline-gradient-${color.replace(/[^a-zA-Z0-9]/g, '')}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
});

// ============================================================
// PROGRESS RING COMPONENT
// ============================================================

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  showValue?: boolean;
  className?: string;
}

const ProgressRing = memo(function ProgressRing({
  value,
  max = 100,
  size = 60,
  strokeWidth = 6,
  color = 'hsl(var(--primary))',
  bgColor = 'hsl(var(--muted))',
  showValue = true,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(Math.max(value / max, 0), 1);
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold">{Math.round(progress * 100)}%</span>
        </div>
      )}
    </div>
  );
});

// ============================================================
// KPI WIDGET COMPONENT
// ============================================================

function KPIWidgetComponent({
  title,
  value,
  previousValue,
  change,
  changeLabel = 'vs período anterior',
  target,
  targetLabel = 'Meta',
  icon: Icon,
  iconColor = 'text-primary',
  sparklineData,
  format = 'number',
  variant = 'default',
  isLoading = false,
  className,
}: KPIWidgetProps) {
  // Calculate change if not provided
  const calculatedChange = useMemo(() => {
    if (change !== undefined) return change;
    if (previousValue !== undefined && typeof value === 'number' && typeof previousValue === 'number') {
      return previousValue !== 0
        ? Math.round(((value - previousValue) / previousValue) * 100)
        : 0;
    }
    return undefined;
  }, [change, value, previousValue]);

  const isPositive = calculatedChange !== undefined && calculatedChange > 0;
  const isNegative = calculatedChange !== undefined && calculatedChange < 0;

  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const trendColor = isPositive
    ? 'text-success'
    : isNegative
    ? 'text-destructive'
    : 'text-muted-foreground';

  // Format value
  const formattedValue = useMemo(() => {
    if (typeof value === 'string') return value;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case 'percent':
        return `${value.toFixed(1)}%`;
      case 'duration': {
        const hours = Math.floor(value / 60);
        const mins = value % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
      }
      default:
        return value.toLocaleString('pt-BR');
    }
  }, [value, format]);

  // Progress towards target
  const targetProgress = useMemo(() => {
    if (target === undefined || typeof value !== 'number') return undefined;
    return (value / target) * 100;
  }, [value, target]);

  if (isLoading) {
    return (
      <Card className={cn('p-5', className)}>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
        {variant === 'detailed' && <Skeleton className="h-10 w-full mt-4" />}
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={cn('p-4 hover-lift', className)}>
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-muted/50">
              <Icon className={cn('h-5 w-5', iconColor)} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold">{formattedValue}</span>
              {calculatedChange !== undefined && (
                <span className={cn('text-xs font-medium flex items-center gap-0.5', trendColor)}>
                  <TrendIcon className="h-3 w-3" />
                  {Math.abs(calculatedChange)}%
                </span>
              )}
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
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-xs text-muted-foreground">
                    / {typeof target === 'number' ? target.toLocaleString('pt-BR') : target}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{targetLabel}</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Change indicator */}
          {calculatedChange !== undefined && (
            <div className="flex items-center gap-2 mt-2">
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium',
                  isPositive && 'bg-success/10 text-success',
                  isNegative && 'bg-destructive/10 text-destructive',
                  !isPositive && !isNegative && 'bg-muted text-muted-foreground'
                )}
              >
                <TrendIcon className="h-3 w-3" />
                {calculatedChange > 0 ? '+' : ''}
                {calculatedChange}%
              </span>
              <span className="text-xs text-muted-foreground">{changeLabel}</span>
            </div>
          )}
        </div>

        {/* Icon or Progress Ring */}
        {targetProgress !== undefined ? (
          <ProgressRing
            value={targetProgress}
            size={48}
            strokeWidth={5}
            color={
              targetProgress >= 100
                ? 'hsl(var(--success))'
                : targetProgress >= 70
                ? 'hsl(var(--primary))'
                : 'hsl(var(--warning))'
            }
          />
        ) : Icon ? (
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-muted/50">
            <Icon className={cn('h-6 w-6', iconColor)} />
          </div>
        ) : null}
      </div>

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 1 && (
        <div className="mt-4 -mx-5 -mb-5 px-5 pb-2 pt-2 bg-muted/30">
          <Sparkline
            data={sparklineData}
            height={40}
            color={
              calculatedChange !== undefined && calculatedChange < 0
                ? 'hsl(var(--destructive))'
                : 'hsl(var(--primary))'
            }
          />
        </div>
      )}

      {/* Detailed variant extras */}
      {variant === 'detailed' && previousValue !== undefined && (
        <div className="mt-4 pt-4 border-t border-border/50 flex justify-between text-xs text-muted-foreground">
          <span>Período anterior</span>
          <span className="font-medium">
            {typeof previousValue === 'number' ? previousValue.toLocaleString('pt-BR') : previousValue}
          </span>
        </div>
      )}
    </Card>
  );
}

export const KPIWidget = memo(KPIWidgetComponent);

// ============================================================
// KPI GRID
// ============================================================

interface KPIGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

function KPIGridComponent({ children, columns = 4, className }: KPIGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  };

  return <div className={cn('grid gap-4', gridCols[columns], className)}>{children}</div>;
}

export const KPIGrid = memo(KPIGridComponent);
