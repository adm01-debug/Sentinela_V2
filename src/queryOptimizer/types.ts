export interface QueryPlan { sql: string; estimatedCost: number; estimatedRows: number; operations: PlanOperation[]; }
export interface PlanOperation { type: 'scan' | 'index_scan' | 'join' | 'sort' | 'aggregate'; table?: string; index?: string; cost: number; }
export interface QueryStats { executionTime: number; rowsRead: number; rowsReturned: number; indexesUsed: string[]; }