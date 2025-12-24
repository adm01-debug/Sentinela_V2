export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'scatter';
export interface ChartConfig { type: ChartType; data: { labels: string[]; datasets: { label: string; data: number[]; color?: string }[] }; options?: { legend?: boolean; tooltip?: boolean; animation?: boolean }; }
export class ChartConfigBuilder {
  private config: ChartConfig = { type: 'line', data: { labels: [], datasets: [] } };
  setType(type: ChartType): this { this.config.type = type; return this; }
  setLabels(labels: string[]): this { this.config.data.labels = labels; return this; }
  addDataset(label: string, data: number[], color?: string): this { this.config.data.datasets.push({ label, data, color }); return this; }
  setOptions(options: ChartConfig['options']): this { this.config.options = options; return this; }
  build(): ChartConfig { return { ...this.config }; }
}
export const createChartConfig = () => new ChartConfigBuilder();
