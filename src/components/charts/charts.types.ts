export interface ChartProps {
  data: any[];
  xAxisKey?: string;
  width?: string | number;
  height?: number;
  className?: string;
}
export interface ChartDataPoint {
  [key: string]: string | number;
}
export interface ChartTheme {
  colors: string[];
  backgroundColor: string;
  textColor: string;
  gridColor: string;
  tooltipBackground: string;
}
export const defaultChartTheme: ChartTheme = {
  colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f'],
  backgroundColor: '#ffffff',
  textColor: '#333333',
  gridColor: '#e0e0e0',
  tooltipBackground: '#ffffff',
};
export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'radar' | 'scatter' | 'composed' | 'heatmap' | 'treemap' | 'funnel' | 'gauge';
