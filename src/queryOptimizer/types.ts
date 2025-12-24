export interface QueryPlan {
  type: string;
  table?: string;
  index?: string;
  rows: number;
  cost: number;
  children?: QueryPlan[];
}

export interface QueryStats {
  executionTime: number;
  rowsExamined: number;
  rowsReturned: number;
  indexesUsed: string[];
  warnings: string[];
}

export interface OptimizationSuggestion {
  type: 'index' | 'rewrite' | 'hint';
  description: string;
  impact: 'high' | 'medium' | 'low';
  sql?: string;
}