import { QueryStats } from './types';

export class QueryAnalyzer {
  private queryHistory: Map<string, QueryStats[]> = new Map();
  
  record(sql: string, stats: QueryStats): void {
    const history = this.queryHistory.get(sql) ?? [];
    history.push(stats);
    if (history.length > 100) history.shift();
    this.queryHistory.set(sql, history);
  }
  
  getSlowQueries(threshold: number): { sql: string; avgTime: number }[] {
    const slow: { sql: string; avgTime: number }[] = [];
    this.queryHistory.forEach((stats, sql) => {
      const avgTime = stats.reduce((sum, s) => sum + s.executionTime, 0) / stats.length;
      if (avgTime > threshold) slow.push({ sql, avgTime });
    });
    return slow.sort((a, b) => b.avgTime - a.avgTime);
  }
  
  suggestIndexes(): IndexSuggestion[] {
    const suggestions: IndexSuggestion[] = [];
    this.queryHistory.forEach((stats, sql) => {
      if (stats.some(s => s.indexesUsed.length === 0 && s.rowsRead > 1000)) {
        suggestions.push({ table: this.extractTable(sql), columns: this.extractWhereColumns(sql), reason: 'Full table scan on large table' });
      }
    });
    return suggestions;
  }
  
  private extractTable(sql: string): string { return sql.match(/FROM\s+(\w+)/i)?.[1] ?? 'unknown'; }
  private extractWhereColumns(sql: string): string[] { return sql.match(/WHERE\s+(\w+)/gi)?.map(m => m.replace(/WHERE\s+/i, '')) ?? []; }
}

export interface IndexSuggestion { table: string; columns: string[]; reason: string; }