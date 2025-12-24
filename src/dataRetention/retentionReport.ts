import { retentionPolicy } from './retentionPolicy';
import { dataLifecycle } from './dataLifecycle';
export interface RetentionReport { generatedAt: Date; totalRules: number; activeRecords: number; archivedRecords: number; deletedRecords: number; }
export function generateRetentionReport(): RetentionReport { return { generatedAt: new Date(), totalRules: retentionPolicy.getAllRules().length, activeRecords: dataLifecycle.getByStage('active').length, archivedRecords: dataLifecycle.getByStage('archived').length, deletedRecords: dataLifecycle.getByStage('deleted').length }; }
