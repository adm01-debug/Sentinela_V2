import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({ title, value, change, changeLabel, icon: Icon, className }: StatCardProps) {
  const TrendIcon = change && change > 0 ? TrendingUp : change && change < 0 ? TrendingDown : Minus;
  const trendColor = change && change > 0 ? 'text-green-500' : change && change < 0 ? 'text-red-500' : 'text-muted-foreground';

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={cn('flex items-center text-xs mt-1', trendColor)}>
            <TrendIcon className="h-3 w-3 mr-1" />
            {Math.abs(change)}% {changeLabel || 'vs período anterior'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
