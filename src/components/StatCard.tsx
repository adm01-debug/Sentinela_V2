import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variantStyles = {
  default: 'border-border/50 bg-card',
  success: 'border-success/30 bg-success/5',
  warning: 'border-warning/30 bg-warning/5',
  danger: 'border-destructive/30 bg-destructive/5',
};

const iconVariantStyles = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-destructive/10 text-destructive',
};

export function StatCard({ title, value, icon: Icon, trend, variant = 'default', className }: StatCardProps) {
  return (
    <div className={cn(
      'rounded-xl border p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]',
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {trend && (
            <p className={cn(
              'text-xs font-medium',
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% vs ontem
            </p>
          )}
        </div>
        <div className={cn('rounded-lg p-3', iconVariantStyles[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
