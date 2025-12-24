import { QueryPlan, OptimizationSuggestion } from './types';

export class QueryOptimizer {
  private rules: OptimizationRule[] = [];
  
  addRule(rule: OptimizationRule): void { this.rules.push(rule); }
  
  optimize(query: string): OptimizedQuery {
    let optimized = query;
    const suggestions: OptimizationSuggestion[] = [];
    for (const rule of this.rules) {
      const result = rule.apply(optimized);
      if (result.modified) { optimized = result.query; suggestions.push(...result.suggestions); }
    }
    return { original: query, optimized, suggestions };
  }
  
  async explain(query: string): Promise<QueryPlan> {
    return { type: 'SELECT', rows: 100, cost: 10 };
  }
}

export interface OptimizationRule {
  name: string;
  apply(query: string): { modified: boolean; query: string; suggestions: OptimizationSuggestion[] };
}

export interface OptimizedQuery {
  original: string;
  optimized: string;
  suggestions: OptimizationSuggestion[];
}

export class SelectStarRule implements OptimizationRule {
  name = 'select-star';
  apply(query: string): { modified: boolean; query: string; suggestions: OptimizationSuggestion[] } {
    if (query.toLowerCase().includes('select *')) {
      return { modified: false, query, suggestions: [{ type: 'rewrite', description: 'Avoid SELECT *, specify columns explicitly', impact: 'medium' }] };
    }
    return { modified: false, query, suggestions: [] };
  }
}