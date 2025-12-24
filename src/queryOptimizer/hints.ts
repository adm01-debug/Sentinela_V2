export class QueryHints {
  private hints: Map<string, string[]> = new Map();
  
  forceIndex(table: string, index: string): this { this.addHint(table, 'FORCE INDEX(' + index + ')'); return this; }
  useIndex(table: string, index: string): this { this.addHint(table, 'USE INDEX(' + index + ')'); return this; }
  ignoreIndex(table: string, index: string): this { this.addHint(table, 'IGNORE INDEX(' + index + ')'); return this; }
  
  private addHint(table: string, hint: string): void {
    const existing = this.hints.get(table) ?? [];
    existing.push(hint);
    this.hints.set(table, existing);
  }
  
  apply(sql: string): string {
    let result = sql;
    this.hints.forEach((hints, table) => {
      const tableRegex = new RegExp('FROM\\s+' + table + '(\\s|$)', 'gi');
      result = result.replace(tableRegex, 'FROM ' + table + ' ' + hints.join(' ') + ' ');
    });
    return result;
  }
  
  clear(): void { this.hints.clear(); }
}