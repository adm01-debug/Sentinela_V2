import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: number;
  trendLabel?: string;
  color?: 'default' | 'success' | 'warning' | 'destructive';
  className?: string;
  loading?: boolean;
}

// ============================================================
// TREND INDICATOR
// ============================================================

function TrendIndicator({ 
  value, 
  label 
}: { 
  value: number; 
  label?: string;
}) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const color = isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-muted-foreground';

  return (
    <div 
      className={cn('flex items-center gap-1 text-xs', color)}
      role="status"
      aria-live="polite"
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span aria-label={`Tendência: ${isPositive ? 'positiva' : isNegative ? 'negativa' : 'neutra'}, ${Math.abs(value)}%`}>
        {isPositive && '+'}
        {value}%
      </span>
      {label && (
        <span className="text-muted-foreground ml-1">
          {label}
        </span>
      )}
    </div>
  );
}

// ============================================================
// STAT CARD COMPONENT
// ============================================================

function StatCardComponent({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendLabel,
  color = 'default',
  className,
  loading = false,
}: StatCardProps) {
  const colorClasses = {
    default: 'text-primary',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    destructive: 'text-red-500',
  };

  const bgClasses = {
    default: 'bg-primary/10',
    success: 'bg-green-500/10',
    warning: 'bg-yellow-500/10',
    destructive: 'bg-red-500/10',
  };

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-8 w-8 bg-muted rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-20 bg-muted rounded mb-1" />
          <div className="h-3 w-32 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn('transition-shadow hover:shadow-md', className)}
      role="region"
      aria-labelledby={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle 
          id={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}
          className="text-sm font-medium text-muted-foreground"
        >
          {title}
        </CardTitle>
        <div 
          className={cn(
            'h-8 w-8 rounded-lg flex items-center justify-center',
            bgClasses[color]
          )}
          aria-hidden="true"
        >
          <Icon className={cn('h-4 w-4', colorClasses[color])} />
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="text-2xl font-bold"
          aria-label={`${title}: ${value}`}
        >
          {value}
        </div>
        <div className="flex items-center justify-between mt-1">
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
          {trend !== undefined && (
            <TrendIndicator value={trend} label={trendLabel} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// EXPORTS
// ============================================================

export const StatCard = memo(StatCardComponent);
StatCard.displayName = 'StatCard';
