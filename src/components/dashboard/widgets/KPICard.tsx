import { memo, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

export interface KPICardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  format?: 'number' | 'currency' | 'percentage';
  target?: number;
  targetLabel?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'glass';
}

function KPICardComponent({ title, value, change, changeLabel = 'vs período anterior', icon, trend, format = 'number', target, targetLabel = 'da meta', className, size = 'md', variant = 'default' }: KPICardProps) {
  const getTrendIcon = () => { if (trend === 'up') return <TrendingUp className="h-4 w-4" />; if (trend === 'down') return <TrendingDown className="h-4 w-4" />; return <Minus className="h-4 w-4" />; };
  const getTrendColor = () => { if (trend === 'up') return 'text-success'; if (trend === 'down') return 'text-destructive'; return 'text-muted-foreground'; };
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    if (format === 'currency') return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    if (format === 'percentage') return `${val.toFixed(1)}%`;
    return new Intl.NumberFormat('pt-BR').format(val);
  };
  const progress = target ? (Number(value) / target) * 100 : null;
  const sizeClasses = { sm: 'p-3', md: 'p-4', lg: 'p-6' };
  const valueSizeClasses = { sm: 'text-xl', md: 'text-2xl sm:text-3xl', lg: 'text-3xl sm:text-4xl' };
  const variantClasses = { default: 'bg-card border', gradient: 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 border', glass: 'bg-card/50 backdrop-blur-sm border' };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className={cn('rounded-xl', variantClasses[variant], sizeClasses[size], className)}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && <div className="p-2 bg-primary/10 rounded-lg text-primary">{icon}</div>}
      </div>
      <div className="mt-2">
        <p className={cn('font-bold text-foreground tracking-tight', valueSizeClasses[size])}>{formatValue(value)}</p>
        {change !== undefined && (
          <div className={cn('flex items-center gap-1 mt-2 text-sm', getTrendColor())}>
            {getTrendIcon()}
            <span className="font-medium">{change > 0 ? '+' : ''}{change.toFixed(1)}%</span>
            <span className="text-muted-foreground">{changeLabel}</span>
          </div>
        )}
        {progress !== null && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">{targetLabel}</span>
              <span className="font-medium">{progress.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} className={cn('h-full rounded-full', progress >= 100 ? 'bg-success' : 'bg-primary')} />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export const KPICard = memo(KPICardComponent);
