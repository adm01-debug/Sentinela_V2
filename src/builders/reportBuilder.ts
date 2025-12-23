interface ReportSection { type: 'header' | 'text' | 'table' | 'chart'; content: any; }
export class ReportBuilder {
  private sections: ReportSection[] = [];
  header(text: string, level = 1) { this.sections.push({ type: 'header', content: { text, level } }); return this; }
  text(content: string) { this.sections.push({ type: 'text', content }); return this; }
  table(headers: string[], rows: any[][]) { this.sections.push({ type: 'table', content: { headers, rows } }); return this; }
  chart(config: any) { this.sections.push({ type: 'chart', content: config }); return this; }
  build() { return this.sections; }
}
