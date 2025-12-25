export interface ChangeEvent { table: string; operation: 'INSERT' | 'UPDATE' | 'DELETE'; before?: unknown; after?: unknown; timestamp: number; }
