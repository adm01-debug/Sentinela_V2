import { memo, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Widget Card - Base container for dashboard widgets
export interface WidgetCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  infoTooltip?: string;
}

function WidgetCardComponent({
  title,
  subtitle,
  children,
  className,
  actions,
  loading = false,
  error,
  onRetry,
  infoTooltip,
}: WidgetCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'bg-card border rounded-xl p-4 sm:p-6',
        'transition-shadow duration-200 hover:shadow-md',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {infoTooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>{infoTooltip}</TooltipContent>
              </Tooltip>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-destructive mb-2">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm text-primary hover:underline"
            >
              Tentar novamente
            </button>
          )}
        </div>
      ) : (
        children
      )}
    </motion.div>
  );
}

export const WidgetCard = memo(WidgetCardComponent);

// KPI Card - For displaying key metrics
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

function KPICardComponent({
  title,
  value,
  previousValue,
  change,
  changeLabel = 'vs período anterior',
  icon,
  trend,
  format = 'number',
  target,
  targetLabel = 'da meta',
  className,
  size = 'md',
  variant = 'default',
}: KPICardProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-success';
    if (trend === 'down') return 'text-destructive';
    return 'text-muted-foreground';
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    if (format === 'currency') {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    }
    if (format === 'percentage') return `${val.toFixed(1)}%`;
    return new Intl.NumberFormat('pt-BR').format(val);
  };

  const progress = target ? (Number(value) / target) * 100 : null;

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const valueSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-3xl sm:text-4xl',
  };

  const variantClasses = {
    default: 'bg-card border',
    gradient: 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 border',
    glass: 'bg-card/50 backdrop-blur-sm border',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-xl',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && (
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2">
        <p className={cn('font-bold text-foreground tracking-tight', valueSizeClasses[size])}>
          {formatValue(value)}
        </p>

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
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={cn(
                  'h-full rounded-full',
                  progress >= 100 ? 'bg-success' : 'bg-primary'
                )}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export const KPICard = memo(KPICardComponent);

// Sparkline Mini Chart
export interface SparklineProps {
  data: number[];
  color?: 'primary' | 'success' | 'warning' | 'destructive';
  height?: number;
  showArea?: boolean;
  className?: string;
}

function SparklineComponent({
  data,
  color = 'primary',
  height = 40,
  showArea = true,
  className,
}: SparklineProps) {
  if (data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const width = 100;
  const padding = 2;
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + (1 - (value - min) / range) * chartHeight;
    return `${x},${y}`;
  });

  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;

  const colorMap = {
    primary: 'stroke-primary fill-primary/20',
    success: 'stroke-success fill-success/20',
    warning: 'stroke-warning fill-warning/20',
    destructive: 'stroke-destructive fill-destructive/20',
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('w-full', className)}
      style={{ height }}
    >
      {showArea && (
        <path
          d={areaPath}
          className={colorMap[color]}
          strokeWidth="0"
        />
      )}
      <path
        d={linePath}
        fill="none"
        className={colorMap[color]}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const Sparkline = memo(SparklineComponent);

// Stat with Sparkline
export interface StatWithSparklineProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  data: number[];
  icon?: ReactNode;
  className?: string;
}

function StatWithSparklineComponent({
  title,
  value,
  change,
  trend = 'neutral',
  data,
  icon,
  className,
}: StatWithSparklineProps) {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-success';
    if (trend === 'down') return 'text-destructive';
    return 'text-muted-foreground';
  };

  const sparklineColor = trend === 'up' ? 'success' : trend === 'down' ? 'destructive' : 'primary';

  return (
    <div className={cn('bg-card border rounded-xl p-4', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{value}</span>
            {change !== undefined && (
              <span className={cn('text-sm font-medium', getTrendColor())}>
                {change > 0 ? '+' : ''}{change}%
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className="p-2 bg-muted rounded-lg">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3">
        <Sparkline data={data} color={sparklineColor} height={32} />
      </div>
    </div>
  );
}

export const StatWithSparkline = memo(StatWithSparklineComponent);

// Comparison Card
export interface ComparisonCardProps {
  title: string;
  items: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  total?: number;
  showPercentages?: boolean;
  className?: string;
}

function ComparisonCardComponent({
  title,
  items,
  total,
  showPercentages = true,
  className,
}: ComparisonCardProps) {
  const calculatedTotal = total || items.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className={cn('bg-card border rounded-xl p-4', className)}>
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, index) => {
          const percentage = (item.value / calculatedTotal) * 100;
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">{item.label}</span>
                <span className="text-sm font-medium">
                  {item.value.toLocaleString('pt-BR')}
                  {showPercentages && (
                    <span className="text-muted-foreground ml-1">
                      ({percentage.toFixed(1)}%)
                    </span>
                  )}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color || `hsl(var(--primary))` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const ComparisonCard = memo(ComparisonCardComponent);
