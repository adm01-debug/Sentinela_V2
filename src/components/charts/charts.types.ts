export interface BaseChartProps {
  data: Record<string, unknown>[];
  height?: number | string;
  width?: number | string;
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export interface LineChartProps extends BaseChartProps {
  xKey: string;
  yKey: string;
  color?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
}

export interface BarChartProps extends BaseChartProps {
  xKey: string;
  yKey: string;
  color?: string;
  horizontal?: boolean;
}

export interface PieChartProps extends BaseChartProps {
  nameKey: string;
  valueKey: string;
  colors?: string[];
  innerRadius?: number;
  outerRadius?: number;
}
