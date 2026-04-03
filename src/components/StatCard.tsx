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
    <Card variant="interactive" className="group relative overflow-hidden">
      {/* Hover gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="p-5 relative">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {Icon && (
            <div className={cn(
              "flex items-center justify-center w-9 h-9 rounded-lg transition-colors",
              iconColor.includes('bg-') ? iconColor : `bg-muted ${iconColor}`
            )}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
        <div className={cn('text-2xl font-bold text-card-foreground tracking-tight', valueClassName)}>{value}</div>
        {trend && (
          <div className={cn(
            'flex items-center text-xs mt-2 font-medium',
            isPositive ? 'text-success' : 'text-destructive'
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            <span>{Math.abs(trend.value)}%</span>
            <span className="text-muted-foreground ml-1 font-normal">{trend.label || 'desde o último período'}</span>
          </div>
        )}
        {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
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
