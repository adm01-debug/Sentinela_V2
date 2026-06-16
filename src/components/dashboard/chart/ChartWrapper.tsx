import { memo, ReactNode } from "react";
import { ChartTypeSwitcher, type ChartType } from "./ChartTypeSwitcher";
import { ChartLegend, type ChartLegendItem } from "./ChartLegend";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  chartType?: ChartType;
  onChartTypeChange?: (type: ChartType) => void;
  availableChartTypes?: ChartType[];
  controls?: ReactNode;
  legend?: ChartLegendItem[];
  onLegendToggle?: (id: string) => void;
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
    <div className={cn("rounded-xl border bg-card p-4 sm:p-6", className)}>
      <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
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
      {legend && legend.length > 0 && (
        <ChartLegend
          items={legend}
          onToggle={onLegendToggle}
          interactive={!!onLegendToggle}
          className="mb-4"
        />
      )}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="mb-2 text-sm text-destructive">{error}</p>
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
