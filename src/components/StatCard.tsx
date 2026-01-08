import { memo, ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  isLoading?: boolean;
  className?: string;
  valueClassName?: string;
  variant?: 'default' | 'gradient' | 'outline' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================
// VARIANTS
// ============================================================

const variants = {
  default: 'bg-card hover:shadow-elevation-2 transition-shadow',
  gradient: 'bg-gradient-card border-0 hover:shadow-elevation-3 transition-all',
  outline: 'bg-transparent border-2 hover:border-primary/50 transition-colors',
  minimal: 'bg-transparent border-0 shadow-none',
};

const sizes = {
  sm: {
    padding: 'p-3 sm:p-4',
    iconSize: 'h-8 w-8',
    iconInner: 'h-4 w-4',
    title: 'text-[10px] sm:text-xs',
    value: 'text-lg sm:text-xl',
    trend: 'text-[9px] sm:text-[10px]',
  },
  md: {
    padding: 'p-4 sm:p-5',
    iconSize: 'h-9 w-9 sm:h-10 sm:w-10',
    iconInner: 'h-4 w-4 sm:h-5 sm:w-5',
    title: 'text-xs sm:text-sm',
    value: 'text-xl sm:text-2xl',
    trend: 'text-[10px] sm:text-xs',
  },
  lg: {
    padding: 'p-5 sm:p-6',
    iconSize: 'h-10 w-10 sm:h-12 sm:w-12',
    iconInner: 'h-5 w-5 sm:h-6 sm:w-6',
    title: 'text-xs sm:text-sm',
    value: 'text-2xl sm:text-3xl',
    trend: 'text-xs sm:text-sm',
  },
};

// ============================================================
// COMPONENT
// ============================================================

function StatCardComponent({
  title,
  value,
  subtitle,
  description,
  icon: Icon,
  iconColor = 'text-primary',
  trend,
  isLoading = false,
  className,
  valueClassName,
  variant = 'default',
  size = 'md',
}: StatCardProps) {
  const sizeConfig = sizes[size];

  if (isLoading) {
    return (
      <Card className={cn(variants[variant], sizeConfig.padding, className)}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className={cn('rounded-xl', sizeConfig.iconSize)} />
        </div>
      </Card>
    );
  }

  const TrendIcon =
    trend?.value !== undefined && trend.value > 0
      ? TrendingUp
      : trend?.value !== undefined && trend.value < 0
      ? TrendingDown
      : Minus;

  // Determine if trend is positive (can be overridden)
  const isPositiveTrend = trend?.isPositive ?? (trend?.value !== undefined && trend.value > 0);
  const trendColor = 
    trend?.value !== undefined && trend.value !== 0
      ? isPositiveTrend
        ? 'text-success bg-success/10'
        : 'text-destructive bg-destructive/10'
      : 'text-muted-foreground bg-muted';

  return (
    <Card className={cn(variants[variant], sizeConfig.padding, 'hover-lift', className)}>
      <div className="flex items-start justify-between gap-4">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={cn('font-medium text-muted-foreground', sizeConfig.title)}>
            {title}
          </p>
          
          <div className="flex items-baseline gap-2 mt-1">
            <span className={cn('font-bold tracking-tight', sizeConfig.value, valueClassName)}>
              {value}
            </span>
            {subtitle && (
              <span className="text-sm text-muted-foreground">{subtitle}</span>
            )}
          </div>

          {(description || trend) && (
            <div className="flex items-center gap-2 mt-2">
              {trend && trend.value !== undefined && (
                <span className={cn(
                  'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium',
                  sizeConfig.trend,
                  trendColor
                )}>
                  <TrendIcon className="h-3 w-3" />
                  {trend.value > 0 ? '+' : ''}{trend.value}%
                </span>
              )}
              {(description || trend?.label) && (
                <span className={cn('text-muted-foreground truncate', sizeConfig.trend)}>
                  {description || trend?.label}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div className={cn(
            'flex items-center justify-center rounded-xl bg-muted/50',
            sizeConfig.iconSize
          )}>
            <Icon className={cn(sizeConfig.iconInner, iconColor)} />
          </div>
        )}
      </div>
    </Card>
  );
}

export const StatCard = memo(StatCardComponent);

// ============================================================
// STAT CARDS GRID
// ============================================================

interface StatCardsGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

function StatCardsGridComponent({
  children,
  columns = 4,
  className,
}: StatCardsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-3 sm:gap-4', gridCols[columns], className)}>
      {children}
    </div>
  );
}

export const StatCardsGrid = memo(StatCardsGridComponent);

// ============================================================
// SPECIALIZED STAT CARDS
// ============================================================

export const CountStatCard = memo(function CountStatCard({
  title,
  count,
  previousCount,
  icon,
  isLoading,
}: {
  title: string;
  count: number;
  previousCount?: number;
  icon?: ReactNode;
  isLoading?: boolean;
}) {
  const trend = previousCount
    ? {
        value: Math.round(((count - previousCount) / previousCount) * 100),
        label: 'vs período anterior',
      }
    : undefined;

  return (
    <StatCard
      title={title}
      value={count.toLocaleString()}
      trend={trend}
      icon={icon}
      isLoading={isLoading}
    />
  );
});

export const PercentStatCard = memo(function PercentStatCard({
  title,
  value,
  description,
  icon,
  isLoading,
}: {
  title: string;
  value: number;
  description?: string;
  icon?: ReactNode;
  isLoading?: boolean;
}) {
  const valueColor =
    value >= 80
      ? 'text-green-600'
      : value >= 60
      ? 'text-yellow-600'
      : 'text-red-600';

  return (
    <StatCard
      title={title}
      value={`${value.toFixed(1)}%`}
      description={description}
      icon={icon}
      isLoading={isLoading}
      valueClassName={valueColor}
    />
  );
});

export const CurrencyStatCard = memo(function CurrencyStatCard({
  title,
  value,
  previousValue,
  icon,
  isLoading,
}: {
  title: string;
  value: number;
  previousValue?: number;
  icon?: ReactNode;
  isLoading?: boolean;
}) {
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

  const trend = previousValue
    ? {
        value: Math.round(((value - previousValue) / previousValue) * 100),
      }
    : undefined;

  return (
    <StatCard
      title={title}
      value={formattedValue}
      trend={trend}
      icon={icon}
      isLoading={isLoading}
    />
  );
});
