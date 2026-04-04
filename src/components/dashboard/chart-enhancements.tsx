import { memo, useState, useCallback, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  LineChart, 
  AreaChart, 
  PieChart, 
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Chart Type Switcher
export type ChartType = 'line' | 'bar' | 'area' | 'pie';

export interface ChartTypeSwitcherProps {
  value: ChartType;
  onChange: (type: ChartType) => void;
  availableTypes?: ChartType[];
  className?: string;
}

const chartTypeIcons = {
  line: LineChart,
  bar: BarChart3,
  area: AreaChart,
  pie: PieChart,
};

function ChartTypeSwitcherComponent({
  value,
  onChange,
  availableTypes = ['line', 'bar', 'area'],
  className,
}: ChartTypeSwitcherProps) {
  return (
    <div className={cn('flex items-center gap-1 p-1 bg-muted rounded-lg', className)}>
      {availableTypes.map((type) => {
        const Icon = chartTypeIcons[type];
        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={cn(
              'p-2 rounded-md transition-all',
              value === type
                ? 'bg-background shadow-sm text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}

export const ChartTypeSwitcher = memo(ChartTypeSwitcherComponent);

// Chart Controls
export interface ChartControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReset?: () => void;
  onExport?: (format: 'png' | 'svg' | 'pdf') => void;
  className?: string;
}

function ChartControlsComponent({
  onZoomIn,
  onZoomOut,
  onReset,
  onExport,
  className,
}: ChartControlsProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {onZoomIn && (
        <Button variant="ghost" size="icon" onClick={onZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
      )}
      {onZoomOut && (
        <Button variant="ghost" size="icon" onClick={onZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
      )}
      {onReset && (
        <Button variant="ghost" size="icon" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}
      {onExport && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onExport('png')}>
              Exportar como PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('svg')}>
              Exportar como SVG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('pdf')}>
              Exportar como PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

export const ChartControls = memo(ChartControlsComponent);

// Chart Legend
export interface ChartLegendItem {
  id: string;
  label: string;
  color: string;
  value?: number | string;
  active?: boolean;
}

export interface ChartLegendProps {
  items: ChartLegendItem[];
  onToggle?: (id) => void;
  interactive?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

function ChartLegendComponent({
  items,
  onToggle,
  interactive = true,
  orientation = 'horizontal',
  className,
}: ChartLegendProps) {
  return (
    <div
      className={cn(
        'flex gap-4',
        orientation === 'vertical' ? 'flex-col' : 'flex-wrap',
        className
      )}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => interactive && onToggle?.(item.id)}
          disabled={!interactive}
          className={cn(
            'flex items-center gap-2 text-sm transition-opacity',
            interactive && 'cursor-pointer hover:opacity-80',
            item.active === false && 'opacity-40'
          )}
        >
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-muted-foreground">{item.label}</span>
          {item.value !== undefined && (
            <span className="font-medium">{item.value}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export const ChartLegend = memo(ChartLegendComponent);

// Threshold Line Component (for use with Recharts)
export interface ThresholdLineProps {
  value: number;
  label?: string;
  color?: string;
  strokeDasharray?: string;
}

export function ThresholdLine({
  value,
  label,
  color = 'hsl(var(--destructive))',
  strokeDasharray = '5 5',
}: ThresholdLineProps) {
  return {
    value,
    label,
    color,
    strokeDasharray,
  };
}

// Annotation Component
export interface ChartAnnotation {
  x: number | string;
  y: number;
  label: string;
  description?: string;
  type?: 'point' | 'range';
  endX?: number | string;
}

export interface ChartAnnotationsProps {
  annotations: ChartAnnotation[];
  className?: string;
}

function ChartAnnotationsComponent({
  annotations,
  className,
}: ChartAnnotationsProps) {
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);

  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)}>
      {annotations.map((annotation, index) => (
        <div
          key={`${annotation.label}-${index}`}
          className={cn(
            'absolute pointer-events-auto cursor-pointer',
            'w-4 h-4 rounded-full bg-warning border-2 border-background',
            'flex items-center justify-center text-[10px] font-bold text-warning-foreground',
            '-translate-x-1/2 -translate-y-1/2'
          )}
          style={{
            left: `${annotation.x}%`,
            bottom: `${annotation.y}%`,
          }}
          onMouseEnter={() => setActiveAnnotation(annotation.label)}
          onMouseLeave={() => setActiveAnnotation(null)}
        >
          {index + 1}
          {activeAnnotation === annotation.label && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50"
            >
              <div className="bg-popover border rounded-lg shadow-lg p-2 min-w-[150px]">
                <p className="font-medium text-sm">{annotation.label}</p>
                {annotation.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {annotation.description}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}

export const ChartAnnotations = memo(ChartAnnotationsComponent);

// Period Comparison Selector
export interface PeriodComparisonProps {
  currentPeriod: string;
  comparisonPeriod?: string;
  onComparisonChange: (period: string | null) => void;
  periods?: Array<{ value: string; label: string }>;
  className?: string;
}

const defaultPeriods = [
  { value: 'previous_period', label: 'Período anterior' },
  { value: 'same_period_last_year', label: 'Mesmo período ano anterior' },
  { value: 'last_7_days', label: 'Últimos 7 dias' },
  { value: 'last_30_days', label: 'Últimos 30 dias' },
];

function PeriodComparisonComponent({
  currentPeriod,
  comparisonPeriod,
  onComparisonChange,
  periods = defaultPeriods,
  className,
}: PeriodComparisonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          {comparisonPeriod
            ? `Comparando: ${periods.find(p => p.value === comparisonPeriod)?.label}`
            : 'Comparar período'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {comparisonPeriod && (
          <DropdownMenuItem onClick={() => onComparisonChange(null)}>
            Remover comparação
          </DropdownMenuItem>
        )}
        {periods.map((period) => (
          <DropdownMenuItem
            key={period.value}
            onClick={() => onComparisonChange(period.value)}
          >
            {period.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const PeriodComparison = memo(PeriodComparisonComponent);

// Chart Wrapper with common features
export interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  chartType?: ChartType;
  onChartTypeChange?: (type: ChartType) => void;
  availableChartTypes?: ChartType[];
  controls?: ReactNode;
  legend?: ChartLegendItem[];
  onLegendToggle?: (id) => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  className?: string;
}

function ChartWrapperComponent({
  title,
  subtitle,
  children,
  chartType,
  onChartTypeChange,
  availableChartTypes,
  controls,
  legend,
  onLegendToggle,
  loading = false,
  error,
  onRetry,
  className,
}: ChartWrapperProps) {
  return (
    <div className={cn('bg-card border rounded-xl p-4 sm:p-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {chartType && onChartTypeChange && (
            <ChartTypeSwitcher
              value={chartType}
              onChange={onChartTypeChange}
              availableTypes={availableChartTypes}
            />
          )}
          {controls}
        </div>
      </div>

      {/* Legend */}
      {legend && legend.length > 0 && (
        <ChartLegend
          items={legend}
          onToggle={onLegendToggle}
          interactive={!!onLegendToggle}
          className="mb-4"
        />
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-destructive mb-2">{error}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Tentar novamente
            </Button>
          )}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export const ChartWrapper = memo(ChartWrapperComponent);
