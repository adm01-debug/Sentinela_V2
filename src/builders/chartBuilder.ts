interface ChartConfig { type: 'line' | 'bar' | 'pie' | 'area'; data: any[]; xKey: string; yKey: string; title?: string; colors?: string[]; }
export class ChartBuilder {
  private config: Partial<ChartConfig> = {};
  type(t: ChartConfig['type']) { this.config.type = t; return this; }
  data(d: any[]) { this.config.data = d; return this; }
  xAxis(key: string) { this.config.xKey = key; return this; }
  yAxis(key: string) { this.config.yKey = key; return this; }
  title(t: string) { this.config.title = t; return this; }
  colors(c: string[]) { this.config.colors = c; return this; }
  build() { return this.config as ChartConfig; }
}
