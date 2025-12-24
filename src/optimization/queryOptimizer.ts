export interface QueryPlan { originalQuery: string; optimizedQuery: string; suggestions: string[]; }
export class QueryOptimizer {
  analyze(query: string): QueryPlan { const suggestions: string[] = []; let optimized = query; if (query.includes('SELECT *')) { suggestions.push('Avoid SELECT *, specify columns'); optimized = optimized.replace('SELECT *', 'SELECT id, name'); } if (!query.toUpperCase().includes('LIMIT')) suggestions.push('Consider adding LIMIT'); if (query.toUpperCase().includes('LIKE') && query.includes('%')) suggestions.push('Leading wildcards prevent index usage'); return { originalQuery: query, optimizedQuery: optimized, suggestions }; }
}
export const queryOptimizer = new QueryOptimizer();
