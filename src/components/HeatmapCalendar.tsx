import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ============================================================
// TYPES
// ============================================================

interface HeatmapData {
  date: string; // YYYY-MM-DD
  value: number;
  label?: string;
}

interface HeatmapCalendarProps {
  data: HeatmapData[];
  title?: string;
  subtitle?: string;
  startDate?: Date;
  endDate?: Date;
  colorScheme?: 'green' | 'blue' | 'purple' | 'orange' | 'red';
  showLegend?: boolean;
  showMonthLabels?: boolean;
  showDayLabels?: boolean;
  cellSize?: number;
  cellGap?: number;
  emptyColor?: string;
  maxValue?: number;
  onCellClick?: (data: HeatmapData) => void;
  className?: string;
}

// ============================================================
// COLOR SCHEMES
// ============================================================

// Uses semantic HSL tokens with opacity modifiers → dark mode automatic, tenant-themable.
const colorSchemes = {
  green: ['bg-success/20', 'bg-success/40', 'bg-success/70', 'bg-success'],
  blue: ['bg-primary/20', 'bg-primary/40', 'bg-primary/70', 'bg-primary'],
  purple: ['bg-accent/30', 'bg-accent/50', 'bg-accent/75', 'bg-accent'],
  orange: ['bg-warning/20', 'bg-warning/40', 'bg-warning/70', 'bg-warning'],
  red: ['bg-destructive/20', 'bg-destructive/40', 'bg-destructive/70', 'bg-destructive'],
};

const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function getDaysInRange(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const current = new Date(start);
  
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}

// ============================================================
// CELL COMPONENT
// ============================================================

interface HeatmapCellProps {
  date: Date;
  value: number;
  maxValue: number;
  colorScheme: keyof typeof colorSchemes;
  size: number;
  label?: string;
  onClick?: () => void;
}

const HeatmapCell = memo(function HeatmapCell({
  date,
  value,
  maxValue,
  colorScheme,
  size,
  label,
  onClick,
}: HeatmapCellProps) {
  const colors = colorSchemes[colorScheme];
  
  const getColorClass = () => {
    if (value === 0) return 'bg-muted/50';
    const ratio = value / maxValue;
    if (ratio <= 0.25) return colors[0];
    if (ratio <= 0.5) return colors[1];
    if (ratio <= 0.75) return colors[2];
    return colors[3];
  };

  const formattedDate = date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className={cn(
            'rounded-sm transition-all hover:ring-2 hover:ring-ring hover:ring-offset-1',
            getColorClass(),
            onClick && 'cursor-pointer'
          )}
          style={{ width: size, height: size }}
          aria-label={`${formattedDate}: ${label || value}`}
        />
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <div className="font-medium">{formattedDate}</div>
        <div className="text-muted-foreground">
          {label || `${value} ${value === 1 ? 'atividade' : 'atividades'}`}
        </div>
      </TooltipContent>
    </Tooltip>
  );
});

// ============================================================
// LEGEND COMPONENT
// ============================================================

interface LegendProps {
  colorScheme: keyof typeof colorSchemes;
  size: number;
}

const Legend = memo(function Legend({ colorScheme, size }: LegendProps) {
  const colors = colorSchemes[colorScheme];

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <span>Menos</span>
      <div className="flex gap-0.5">
        <div
          className="rounded-sm bg-muted/50"
          style={{ width: size, height: size }}
        />
        {colors.map((color, index) => (
          <div
            key={index}
            className={cn('rounded-sm', color)}
            style={{ width: size, height: size }}
          />
        ))}
      </div>
      <span>Mais</span>
    </div>
  );
});

// ============================================================
// MAIN COMPONENT
// ============================================================

function HeatmapCalendarComponent({
  data,
  title,
  subtitle,
  startDate,
  endDate,
  colorScheme = 'green',
  showLegend = true,
  showMonthLabels = true,
  showDayLabels = true,
  cellSize = 12,
  cellGap = 3,
  maxValue: customMaxValue,
  onCellClick,
  className,
}: HeatmapCalendarProps) {
  // Calculate date range (default: last 52 weeks)
  const { start, end } = useMemo(() => {
    const e = endDate || new Date();
    const s = startDate || new Date(e.getTime() - 52 * 7 * 24 * 60 * 60 * 1000);
    
    // Adjust start to Sunday
    const adjustedStart = new Date(s);
    adjustedStart.setDate(adjustedStart.getDate() - adjustedStart.getDay());
    
    return { start: adjustedStart, end: e };
  }, [startDate, endDate]);

  // Create data map for quick lookup
  const dataMap = useMemo(() => {
    const map = new Map<string, HeatmapData>();
    data.forEach((d) => map.set(d.date, d));
    return map;
  }, [data]);

  // Calculate max value
  const maxValue = useMemo(() => {
    if (customMaxValue) return customMaxValue;
    return Math.max(...data.map((d) => d.value), 1);
  }, [data, customMaxValue]);

  // Generate weeks
  const weeks = useMemo(() => {
    const days = getDaysInRange(start, end);
    const weekGroups: Date[][] = [];
    
    let currentWeek: Date[] = [];
    days.forEach((day) => {
      if (day.getDay() === 0 && currentWeek.length > 0) {
        weekGroups.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    });
    
    if (currentWeek.length > 0) {
      weekGroups.push(currentWeek);
    }
    
    return weekGroups;
  }, [start, end]);

  // Calculate month positions for labels
  const monthPositions = useMemo(() => {
    const positions: { month: number; weekIndex: number }[] = [];
    let lastMonth = -1;
    
    weeks.forEach((week, weekIndex) => {
      const firstDayOfWeek = week[0];
      const month = firstDayOfWeek.getMonth();
      
      if (month !== lastMonth) {
        positions.push({ month, weekIndex });
        lastMonth = month;
      }
    });
    
    return positions;
  }, [weeks]);

  // Total activity
  const totalActivity = useMemo(() => {
    return data.reduce((sum, d) => sum + d.value, 0);
  }, [data]);

  const content = (
    <div className={cn('space-y-4', className)}>
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{totalActivity.toLocaleString('pt-BR')}</div>
          <div className="text-xs text-muted-foreground">atividades no período</div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-1">
          {/* Month labels */}
          {showMonthLabels && (
            <div className="flex" style={{ marginLeft: showDayLabels ? 28 : 0 }}>
              {monthPositions.map(({ month, weekIndex }, index) => {
                const nextPosition = monthPositions[index + 1]?.weekIndex || weeks.length;
                const width = (nextPosition - weekIndex) * (cellSize + cellGap);
                
                return (
                  <div
                    key={`${month}-${weekIndex}`}
                    className="text-xs text-muted-foreground"
                    style={{ width, minWidth: width }}
                  >
                    {monthLabels[month]}
                  </div>
                );
              })}
            </div>
          )}

          {/* Grid */}
          <div className="flex gap-1">
            {/* Day labels */}
            {showDayLabels && (
              <div className="flex flex-col justify-around pr-1" style={{ width: 24 }}>
                {[1, 3, 5].map((dayIndex) => (
                  <div key={dayIndex} className="text-xs text-muted-foreground h-3 flex items-center">
                    {dayLabels[dayIndex]}
                  </div>
                ))}
              </div>
            )}

            {/* Weeks */}
            <div className="flex" style={{ gap: cellGap }}>
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col" style={{ gap: cellGap }}>
                  {/* Pad first week if needed */}
                  {weekIndex === 0 && week[0].getDay() > 0 && (
                    <>
                      {Array.from({ length: week[0].getDay() }).map((_, i) => (
                        <div key={`pad-${i}`} style={{ width: cellSize, height: cellSize }} />
                      ))}
                    </>
                  )}
                  
                  {/* Days */}
                  {week.map((day) => {
                    const dateStr = getDateString(day);
                    const dayData = dataMap.get(dateStr);
                    
                    return (
                      <HeatmapCell
                        key={dateStr}
                        date={day}
                        value={dayData?.value || 0}
                        maxValue={maxValue}
                        colorScheme={colorScheme}
                        size={cellSize}
                        label={dayData?.label}
                        onClick={onCellClick && dayData ? () => onCellClick(dayData) : undefined}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          {showLegend && (
            <div className="flex justify-end pt-2">
              <Legend colorScheme={colorScheme} size={cellSize} />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (title || subtitle) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">{content}</CardContent>
      </Card>
    );
  }

  return content;
}

export const HeatmapCalendar = memo(HeatmapCalendarComponent);

// ============================================================
// MINI HEATMAP (Last 30 days)
// ============================================================

interface MiniHeatmapProps {
  data: HeatmapData[];
  colorScheme?: keyof typeof colorSchemes;
  className?: string;
}

function MiniHeatmapComponent({ data, colorScheme = 'green', className }: MiniHeatmapProps) {
  const last30Days = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 29);
    return { start, end };
  }, []);

  return (
    <HeatmapCalendar
      data={data}
      startDate={last30Days.start}
      endDate={last30Days.end}
      colorScheme={colorScheme}
      showLegend={false}
      showMonthLabels={false}
      showDayLabels={false}
      cellSize={8}
      cellGap={2}
      className={className}
    />
  );
}

export const MiniHeatmap = memo(MiniHeatmapComponent);
