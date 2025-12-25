export type StageStatus = 'pending' | 'running' | 'success' | 'failed';
export interface Stage { name: string; status: StageStatus; }
