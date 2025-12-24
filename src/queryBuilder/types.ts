export interface QueryOptions { distinct?: boolean; limit?: number; offset?: number; }
export interface JoinClause { type: 'inner' | 'left' | 'right' | 'full'; table: string; on: string; }
export interface OrderClause { column: string; direction: 'asc' | 'desc'; }
export interface WhereClause { column: string; operator: string; value: unknown; logic: 'and' | 'or'; }