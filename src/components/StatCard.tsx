import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: { value: number; label?: string; isPositive?: boolean };
  description?: string;
  variant?: 'default' | 'gradient';
  valueClassName?: string;
  isLoading?: boolean;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = 'text-muted-foreground',
  trend, 
  description,
  variant = 'default',
  valueClassName,
  isLoading = false,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
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

  const isPositive = trend?.isPositive ?? (trend?.value !== undefined ? trend.value >= 0 : undefined);

  return (
    <Card className={cn(
      variant === 'gradient' && 'bg-gradient-to-br from-primary/5 to-primary/10'
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className={cn('w-4 h-4', iconColor)} />}
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', valueClassName)}>{value}</div>
        {trend && (
          <div className={cn(
            'flex items-center text-xs mt-1',
            isPositive ? 'text-green-600' : 'text-red-600'
          )}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            {Math.abs(trend.value)}% {trend.label || 'from last period'}
          </div>
        )}
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

interface StatCardsGridProps {
  columns?: 2 | 3 | 4;
  children: ReactNode;
}

export function StatCardsGrid({ columns = 4, children }: StatCardsGridProps) {
  const gridClass = {
    2: 'grid gap-4 md:grid-cols-2',
    3: 'grid gap-4 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid gap-4 md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return <div className={gridClass}>{children}</div>;
}
