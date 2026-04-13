import { memo } from 'react';
import { cn } from '@/lib/utils';
import { BarChart3, LineChart, AreaChart, PieChart } from 'lucide-react';

export type ChartType = 'line' | 'bar' | 'area' | 'pie';

export interface ChartTypeSwitcherProps {
  value: ChartType;
  onChange: (type: ChartType) => void;
  availableTypes?: ChartType[];
  className?: string;
}

const chartTypeIcons = { line: LineChart, bar: BarChart3, area: AreaChart, pie: PieChart };

function ChartTypeSwitcherComponent({ value, onChange, availableTypes = ['line', 'bar', 'area'], className }: ChartTypeSwitcherProps) {
  return (
    <div className={cn('flex items-center gap-1 p-1 bg-muted rounded-lg', className)}>
      {availableTypes.map((type) => {
        const Icon = chartTypeIcons[type];
        return (
          <button key={type} onClick={() => onChange(type)} className={cn('p-2 rounded-md transition-all', value === type ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground')}>
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}

export const ChartTypeSwitcher = memo(ChartTypeSwitcherComponent);
