import { memo, ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  isLoading?: boolean;
  className?: string;
  valueClassName?: string;
}

// ============================================================
// COMPONENT
// ============================================================

function StatCardComponent({
  title,
  value,
  description,
  icon,
  trend,
  isLoading = false,
  className,
  valueClassName,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  const TrendIcon =
    trend?.value && trend.value > 0
      ? TrendingUp
      : trend?.value && trend.value < 0
      ? TrendingDown
      : Minus;

  const trendColor =
    trend?.value && trend.value > 0
      ? 'text-green-600'
      : trend?.value && trend.value < 0
      ? 'text-red-600'
      : 'text-muted-foreground';

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-4 w-4 text-muted-foreground">{icon}</div>
        )}
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', valueClassName)}>{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-1 mt-1">
            {trend && (
              <>
                <TrendIcon className={cn('h-3 w-3', trendColor)} />
                <span className={cn('text-xs font-medium', trendColor)}>
                  {trend.value > 0 ? '+' : ''}
                  {trend.value}%
                </span>
              </>
            )}
            {description && (
              <span className="text-xs text-muted-foreground">
                {trend ? ` ${description}` : description}
              </span>
            )}
          </div>
        )}
      </CardContent>
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
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
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
