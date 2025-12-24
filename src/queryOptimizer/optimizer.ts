import { QueryPlan, PlanOperation } from './types';

export class QueryOptimizer {
  private indexes: Map<string, string[]> = new Map();
  
  registerIndex(table: string, columns: string[]): void {
    const existing = this.indexes.get(table) ?? [];
    this.indexes.set(table, [...existing, columns.join(',')]);
  }
  
  optimize(sql: string): QueryPlan {
    const operations = this.analyzeQuery(sql);
    const optimized = this.applyOptimizations(operations);
    return {
      sql: this.rewriteQuery(sql, optimized),
      estimatedCost: optimized.reduce((sum, op) => sum + op.cost, 0),
      estimatedRows: 100,
      operations: optimized
    };
  }
  
  private analyzeQuery(sql: string): PlanOperation[] {
    const operations: PlanOperation[] = [];
    const tables = this.extractTables(sql);
    
    tables.forEach(table => {
      const hasIndex = this.indexes.has(table);
      operations.push({ type: hasIndex ? 'index_scan' : 'scan', table, cost: hasIndex ? 10 : 100 });
    });
    
    if (sql.includes('ORDER BY')) operations.push({ type: 'sort', cost: 50 });
    if (sql.includes('GROUP BY')) operations.push({ type: 'aggregate', cost: 30 });
    
    return operations;
  }
  
  private applyOptimizations(operations: PlanOperation[]): PlanOperation[] {
    return operations.map(op => {
      if (op.type === 'scan' && op.table && this.indexes.has(op.table)) {
        return { ...op, type: 'index_scan' as const, cost: op.cost / 10 };
      }
      return op;
    });
  }
  
  private extractTables(sql: string): string[] {
    const matches = sql.match(/FROM\s+(\w+)/gi) ?? [];
    return matches.map(m => m.replace(/FROM\s+/i, ''));
  }
  
  private rewriteQuery(sql: string, operations: PlanOperation[]): string { return sql; }
}