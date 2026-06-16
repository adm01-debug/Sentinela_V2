import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Heatmap Cell
interface HeatmapCellProps {
  value: number;
  maxValue: number;
  rowLabel: string;
  colLabel: string;
  colorScale?: "blue" | "green" | "red" | "purple" | "orange";
  onClick?: () => void;
}

const colorScales = {
  blue: [
    "bg-blue-50",
    "bg-blue-100",
    "bg-blue-200",
    "bg-blue-300",
    "bg-blue-400",
    "bg-blue-500",
    "bg-blue-600",
  ],
  green: [
    "bg-green-50",
    "bg-green-100",
    "bg-green-200",
    "bg-green-300",
    "bg-green-400",
    "bg-green-500",
    "bg-green-600",
  ],
  red: [
    "bg-red-50",
    "bg-red-100",
    "bg-red-200",
    "bg-red-300",
    "bg-red-400",
    "bg-red-500",
    "bg-red-600",
  ],
  purple: [
    "bg-purple-50",
    "bg-purple-100",
    "bg-purple-200",
    "bg-purple-300",
    "bg-purple-400",
    "bg-purple-500",
    "bg-purple-600",
  ],
  orange: [
    "bg-orange-50",
    "bg-orange-100",
    "bg-orange-200",
    "bg-orange-300",
    "bg-orange-400",
    "bg-orange-500",
    "bg-orange-600",
  ],
};

const HeatmapCell = memo(function HeatmapCell({
  value,
  maxValue,
  rowLabel,
  colLabel,
  colorScale = "blue",
  onClick,
}: HeatmapCellProps) {
  const intensity = maxValue > 0 ? Math.min(Math.floor((value / maxValue) * 6), 6) : 0;
  const colors = colorScales[colorScale];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          onClick={onClick}
          className={cn(
            "aspect-square w-full rounded-sm transition-all",
            colors[intensity],
            onClick && "cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2"
          )}
        />
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-center">
          <p className="font-medium">{value.toLocaleString("pt-BR")}</p>
          <p className="text-xs text-muted-foreground">
            {rowLabel} - {colLabel}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
});

// Activity Heatmap
export interface ActivityHeatmapData {
  day: number; // 0-6 (Sunday-Saturday)
  hour: number; // 0-23
  value: number;
}

export interface ActivityHeatmapProps {
  data: ActivityHeatmapData[];
  title?: string;
  colorScale?: "blue" | "green" | "red" | "purple" | "orange";
  onCellClick?: (day: number, hour: number, value: number) => void;
  className?: string;
}

const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const hourLabels = ["00h", "03h", "06h", "09h", "12h", "15h", "18h", "21h"];

function ActivityHeatmapComponent({
  data,
  title = "Atividade por Hora",
  colorScale = "blue",
  onCellClick,
  className,
}: ActivityHeatmapProps) {
  // Create a 7x24 matrix
  const matrix: number[][] = Array(7)
    .fill(null)
    .map(() => Array(24).fill(0));

  data.forEach(({ day, hour, value }) => {
    if (day >= 0 && day < 7 && hour >= 0 && hour < 24) {
      matrix[day][hour] = value;
    }
  });

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn("rounded-xl border bg-card p-4", className)}>
      {title && <h3 className="mb-4 text-sm font-semibold">{title}</h3>}

      {/* Hour labels */}
      <div className="mb-2 flex">
        <div className="w-12" /> {/* Spacer for day labels */}
        <div className="grid flex-1 grid-cols-8 gap-1">
          {hourLabels.map((label) => (
            <span key={label} className="text-center text-[10px] text-muted-foreground">
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="space-y-1">
        {dayLabels.map((dayLabel, dayIndex) => (
          <div key={dayLabel} className="flex items-center gap-2">
            <span className="w-10 text-[10px] text-muted-foreground">{dayLabel}</span>
            <div className="grid-cols-24 grid flex-1 gap-[2px]">
              {matrix[dayIndex].map((value, hourIndex) => (
                <HeatmapCell
                  key={`${dayIndex}-${hourIndex}`}
                  value={value}
                  maxValue={maxValue}
                  rowLabel={dayLabel}
                  colLabel={`${hourIndex}h`}
                  colorScale={colorScale}
                  onClick={onCellClick ? () => onCellClick(dayIndex, hourIndex, value) : undefined}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
        <span>Menos</span>
        <div className="flex gap-[2px]">
          {colorScales[colorScale].map((color, index) => (
            <div key={index} className={cn("h-4 w-4 rounded-sm", color)} />
          ))}
        </div>
        <span>Mais</span>
      </div>
    </div>
  );
}

export const ActivityHeatmap = memo(ActivityHeatmapComponent);

// Calendar Heatmap (GitHub style)
export interface CalendarHeatmapData {
  date: string; // YYYY-MM-DD
  value: number;
}

export interface CalendarHeatmapProps {
  data: CalendarHeatmapData[];
  startDate?: Date;
  endDate?: Date;
  colorScale?: "blue" | "green" | "red" | "purple" | "orange";
  onCellClick?: (date: string, value: number) => void;
  className?: string;
}

function CalendarHeatmapComponent({
  data,
  startDate,
  endDate,
  colorScale = "green",
  onCellClick,
  className,
}: CalendarHeatmapProps) {
  const today = new Date();
  const start = startDate || new Date(today.getFullYear(), today.getMonth() - 11, 1);
  const end = endDate || today;

  // Generate all dates in range
  const dates: string[] = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  // Create value map
  const valueMap = new Map(data.map((d) => [d.date, d.value]));
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  // Group by week
  const weeks: string[][] = [];
  let currentWeek: string[] = [];

  dates.forEach((date) => {
    const dayOfWeek = new Date(date).getDay();
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(date);
  });
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Generate month labels
  const monthLabels: { month: string; weekIndex: number }[] = [];
  let lastMonth = "";
  weeks.forEach((week, weekIndex) => {
    const firstDateOfWeek = week[0];
    const month = new Date(firstDateOfWeek).toLocaleDateString("pt-BR", { month: "short" });
    if (month !== lastMonth) {
      monthLabels.push({ month, weekIndex });
      lastMonth = month;
    }
  });

  return (
    <div className={cn("overflow-x-auto rounded-xl border bg-card p-4", className)}>
      {/* Month labels */}
      <div className="mb-2 flex text-[10px] text-muted-foreground">
        {monthLabels.map(({ month, weekIndex }, index) => (
          <div
            key={`${month}-${index}`}
            className="capitalize"
            style={{
              marginLeft: index === 0 ? "32px" : "0",
              width: `${((monthLabels[index + 1]?.weekIndex || weeks.length) - weekIndex) * 14}px`,
            }}
          >
            {month}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex">
        {/* Day labels */}
        <div className="mr-2 flex flex-col gap-[2px] text-[10px] text-muted-foreground">
          <div className="h-3" />
          <div className="h-3">Seg</div>
          <div className="h-3" />
          <div className="h-3">Qua</div>
          <div className="h-3" />
          <div className="h-3">Sex</div>
          <div className="h-3" />
        </div>

        {/* Weeks */}
        <div className="flex gap-[2px]">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[2px]">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const date = week.find((d) => new Date(d).getDay() === dayIndex);
                if (!date) {
                  return <div key={dayIndex} className="h-3 w-3" />;
                }
                const value = valueMap.get(date) || 0;
                const intensity =
                  maxValue > 0 ? Math.min(Math.floor((value / maxValue) * 6), 6) : 0;

                return (
                  <Tooltip key={dayIndex}>
                    <TooltipTrigger asChild>
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: weekIndex * 0.01 }}
                        onClick={() => onCellClick?.(date, value)}
                        className={cn(
                          "h-3 w-3 rounded-sm",
                          colorScales[colorScale][intensity],
                          onCellClick && "cursor-pointer hover:ring-1 hover:ring-primary"
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-center">
                        <p className="font-medium">{value.toLocaleString("pt-BR")}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(date).toLocaleDateString("pt-BR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
        <span>Menos</span>
        <div className="flex gap-[2px]">
          {colorScales[colorScale].map((color, index) => (
            <div key={index} className={cn("h-3 w-3 rounded-sm", color)} />
          ))}
        </div>
        <span>Mais</span>
      </div>
    </div>
  );
}

export const CalendarHeatmap = memo(CalendarHeatmapComponent);
