import * as React from 'react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkline } from './Sparkline';

interface MiniMetricProps {
  label: string;
  value: string | number;
  previousValue?: number;
  trend?: number[];
  format?: 'number' | 'currency' | 'percent';
  className?: string;
}

export function MiniMetric({ label, value, previousValue, trend, format = 'number', className }: MiniMetricProps) {
  const formattedValue = useMemo(() => {
    if (typeof value === 'string') return value;
    switch (format) {
      case 'currency': return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(value);
      case 'percent': return `${value.toFixed(1)}%`;
      default: return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value);
    }
  }, [value, format]);

  const change = useMemo(() => {
    if (previousValue === undefined || typeof value !== 'number') return null;
    const diff = ((value - previousValue) / previousValue) * 100;
    return { value: diff, direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral' as const };
  }, [value, previousValue]);

  return (
    <Card className={cn('', className)}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">{formattedValue}</p>
            {change && (
              <div className={cn('flex items-center gap-1 text-xs', change.direction === 'up' ? 'text-green-600' : change.direction === 'down' ? 'text-red-600' : 'text-gray-600')}>
                {change.direction === 'up' ? <ArrowUp className="h-3 w-3" /> : change.direction === 'down' ? <ArrowDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                <span>{Math.abs(change.value).toFixed(1)}%</span>
              </div>
            )}
          </div>
          {trend && trend.length > 1 && <Sparkline data={trend} width={60} height={24} strokeColor={change?.direction === 'up' ? '#22c55e' : change?.direction === 'down' ? '#ef4444' : '#6366f1'} />}
        </div>
      </CardContent>
    </Card>
  );
}
export default MiniMetric;
