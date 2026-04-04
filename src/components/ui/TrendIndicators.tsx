import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';

// ============================================
// TREND INDICATOR
// ============================================

interface TrendIndicatorProps {
  value: number;
  showIcon?: boolean;
  showValue?: boolean;
  suffix?: string;
  size?: 'sm' | 'md' | 'lg';
  invertColors?: boolean;
  className?: string;
}

export function TrendIndicator({
  value,
  showIcon = true,
  showValue = true,
  suffix = '%',
  size = 'md',
  invertColors = false,
  className,
}: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;

  const getColor = () => {
    if (isNeutral) return 'text-muted-foreground';
    if (invertColors) {
      return isPositive ? 'text-red-600' : 'text-green-600';
    }
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  const sizeStyles = {
    sm: { text: 'text-xs', icon: 'h-3 w-3' },
    md: { text: 'text-sm', icon: 'h-4 w-4' },
    lg: { text: 'text-base', icon: 'h-5 w-5' },
  };

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <span className={cn('inline-flex items-center gap-1 font-medium', getColor(), sizeStyles[size].text, className)}>
      {showIcon && <Icon className={sizeStyles[size].icon} />}
      {showValue && (
        <span>
          {isPositive && '+'}
          {value}
          {suffix}
        </span>
      )}
    </span>
  );
}

// ============================================
// COMPARISON INDICATOR
// ============================================

interface ComparisonIndicatorProps {
  current: number;
  previous: number;
  format?: (value) => string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ComparisonIndicator({
  current,
  previous,
  format = (v) => v.toLocaleString('pt-BR'),
  label,
  size = 'md',
  className,
}: ComparisonIndicatorProps) {
  const diff = current - previous;
  const percentChange = previous !== 0 ? ((diff / previous) * 100) : 0;

  return (
    <div className={cn('flex items-baseline gap-2', className)}>
      <span className="font-bold">{format(current)}</span>
      <TrendIndicator value={Math.round(percentChange)} size={size} />
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
}

// ============================================
// CHANGE BADGE
// ============================================

interface ChangeBadgeProps {
  value: number;
  suffix?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ChangeBadge({
  value,
  suffix = '%',
  size = 'md',
  className,
}: ChangeBadgeProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2.5 py-1',
  };

  const colorStyles = isPositive
    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    : isNegative
    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    : 'bg-muted text-muted-foreground';

  const Icon = isPositive ? ArrowUp : isNegative ? ArrowDown : ArrowRight;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full font-medium',
        sizeStyles[size],
        colorStyles,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(value)}
      {suffix}
    </span>
  );
}

// ============================================
// METRIC COMPARISON
// ============================================

interface MetricComparisonProps {
  label: string;
  current: number;
  previous: number;
  format?: (value) => string;
  className?: string;
}

export function MetricComparison({
  label,
  current,
  previous,
  format = (v) => v.toLocaleString('pt-BR'),
  className,
}: MetricComparisonProps) {
  const diff = current - previous;
  const percentChange = previous !== 0 ? Math.round((diff / previous) * 100) : 0;

  return (
    <div className={cn('space-y-1', className)}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-bold">{format(current)}</span>
        <ChangeBadge value={percentChange} />
      </div>
      <p className="text-xs text-muted-foreground">
        vs. {format(previous)} anterior
      </p>
    </div>
  );
}

// ============================================
// SPARKLINE TREND
// ============================================

interface SparklineTrendProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showEndDot?: boolean;
  className?: string;
}

export function SparklineTrend({
  data,
  width = 100,
  height = 30,
  color,
  showEndDot = true,
  className,
}: SparklineTrendProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const isPositive = data[data.length - 1] >= data[0];
  const strokeColor = color || (isPositive ? '#22c55e' : '#ef4444');

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  const lastPoint = points.split(' ').pop()?.split(',');

  return (
    <svg width={width} height={height} className={className}>
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showEndDot && lastPoint && (
        <circle
          cx={parseFloat(lastPoint[0])}
          cy={parseFloat(lastPoint[1])}
          r={3}
          fill={strokeColor}
        />
      )}
    </svg>
  );
}

export default {
  TrendIndicator,
  ComparisonIndicator,
  ChangeBadge,
  MetricComparison,
  SparklineTrend,
};
