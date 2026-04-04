// Chart types for Sentinela v17

export interface ChartConfig {
  type: ChartType;
  data: ChartData;
  options?: ChartOptions;
  plugins?: ChartPlugin[];
}

export type ChartType = 
  | 'line'
  | 'bar'
  | 'area'
  | 'pie'
  | 'donut'
  | 'scatter'
  | 'radar'
  | 'heatmap'
  | 'treemap'
  | 'funnel'
  | 'gauge'
  | 'sparkline'
  | 'composed';

export interface ChartData {
  labels?: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  id?: string;
  label: string;
  data: ChartDataPoint[];
  type?: ChartType;
  color?: string;
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean | string;
  tension?: number;
  pointRadius?: number;
  stack?: string;
  yAxisId?: string;
  xAxisId?: string;
  hidden?: boolean;
}

export type ChartDataPoint = 
  | number
  | { x: number | string | Date; y: number }
  | { name: string; value: number }
  | null;

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  aspectRatio?: number;
  title?: ChartTitle;
  legend?: ChartLegend;
  tooltip?: ChartTooltip;
  scales?: ChartScales;
  animation?: ChartAnimation;
  interaction?: ChartInteraction;
  layout?: ChartLayout;
  onClick?: (event: ChartEvent, elements: ChartElement[]) => void;
  onHover?: (event: ChartEvent, elements: ChartElement[]) => void;
}

export interface ChartTitle {
  display: boolean;
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  font?: ChartFont;
  color?: string;
  padding?: number | { top?: number; bottom?: number };
}

export interface ChartLegend {
  display?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  labels?: LegendLabels;
  onClick?: (event: ChartEvent, item: LegendItem) => void;
}

export interface LegendLabels {
  boxWidth?: number;
  boxHeight?: number;
  color?: string;
  font?: ChartFont;
  padding?: number;
  usePointStyle?: boolean;
}

export interface LegendItem {
  datasetIndex: number;
  text: string;
  fillStyle?: string;
  strokeStyle?: string;
  hidden?: boolean;
}

export interface ChartTooltip {
  enabled?: boolean;
  mode?: 'point' | 'nearest' | 'index' | 'dataset' | 'x' | 'y';
  intersect?: boolean;
  position?: 'average' | 'nearest';
  backgroundColor?: string;
  titleColor?: string;
  bodyColor?: string;
  borderColor?: string;
  borderWidth?: number;
  padding?: number;
  cornerRadius?: number;
  displayColors?: boolean;
  callbacks?: TooltipCallbacks;
}

export interface TooltipCallbacks {
  title?: (items: TooltipItem[]) => string | string[];
  label?: (item: TooltipItem) => string | string[];
  footer?: (items: TooltipItem[]) => string | string[];
}

export interface TooltipItem {
  datasetIndex: number;
  dataIndex: number;
  label: string;
  value: number;
  formattedValue: string;
  raw: unknown;
}

export interface ChartScales {
  x?: ChartAxis;
  y?: ChartAxis;
  [key: string]: ChartAxis | undefined;
}

export interface ChartAxis {
  type?: 'linear' | 'logarithmic' | 'category' | 'time';
  display?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  title?: AxisTitle;
  min?: number;
  max?: number;
  suggestedMin?: number;
  suggestedMax?: number;
  stacked?: boolean;
  grid?: AxisGrid;
  ticks?: AxisTicks;
  time?: TimeScale;
}

export interface AxisTitle {
  display: boolean;
  text: string;
  color?: string;
  font?: ChartFont;
}

export interface AxisGrid {
  display?: boolean;
  color?: string;
  lineWidth?: number;
  drawBorder?: boolean;
}

export interface AxisTicks {
  display?: boolean;
  color?: string;
  font?: ChartFont;
  maxRotation?: number;
  minRotation?: number;
  callback?: (value, index) => string;
}

export interface TimeScale {
  unit?: 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  displayFormats?: Record<string, string>;
  tooltipFormat?: string;
}

export interface ChartAnimation {
  duration?: number;
  easing?: string;
  delay?: number;
  loop?: boolean;
}

export interface ChartInteraction {
  mode?: 'point' | 'nearest' | 'index' | 'dataset' | 'x' | 'y';
  intersect?: boolean;
  axis?: 'x' | 'y' | 'xy';
}

export interface ChartLayout {
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
}

export interface ChartFont {
  family?: string;
  size?: number;
  weight?: string | number;
  style?: 'normal' | 'italic';
}

export interface ChartEvent {
  type: string;
  native: Event;
  x: number;
  y: number;
}

export interface ChartElement {
  datasetIndex: number;
  index: number;
  element: unknown;
}

export interface ChartPlugin {
  id: string;
  beforeInit?: (chart) => void;
  afterInit?: (chart) => void;
  beforeDraw?: (chart) => void;
  afterDraw?: (chart) => void;
  [key: string]: unknown;
}

export interface ChartRef {
  getBase64Image: () => string;
  downloadImage: (filename?: string, format?: 'png' | 'jpeg') => void;
  resetZoom: () => void;
  update: (mode?: 'none' | 'show' | 'hide' | 'default') => void;
}
