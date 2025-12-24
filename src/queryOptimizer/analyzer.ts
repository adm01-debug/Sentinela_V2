import { QueryStats, OptimizationSuggestion } from './types';

export class QueryAnalyzer {
  private slowQueryThreshold: number;
  private slowQueries: SlowQuery[] = [];
  
  constructor(slowQueryThresholdMs: number = 1000) { this.slowQueryThreshold = slowQueryThresholdMs; }
  
  analyze(query: string, stats: QueryStats): AnalysisResult {
    const suggestions: OptimizationSuggestion[] = [];
    if (stats.executionTime > this.slowQueryThreshold) {
      this.slowQueries.push({ query, stats, timestamp: new Date() });
      suggestions.push({ type: 'hint', description: 'Query is slow, consider optimization', impact: 'high' });
    }
    if (stats.rowsExamined > stats.rowsReturned * 10) {
      suggestions.push({ type: 'index', description: 'High row examination ratio, consider adding index', impact: 'high' });
    }
    if (stats.indexesUsed.length === 0) {
      suggestions.push({ type: 'index', description: 'No indexes used, full table scan detected', impact: 'high' });
    }
    return { query, stats, suggestions, isSlow: stats.executionTime > this.slowQueryThreshold };
  }
  
  getSlowQueries(limit: number = 10): SlowQuery[] { return this.slowQueries.slice(-limit); }
  clearSlowQueries(): void { this.slowQueries = []; }
}

export interface AnalysisResult { query: string; stats: QueryStats; suggestions: OptimizationSuggestion[]; isSlow: boolean; }
export interface SlowQuery { query: string; stats: QueryStats; timestamp: Date; }