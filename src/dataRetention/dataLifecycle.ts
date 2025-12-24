export type LifecycleStage = 'active' | 'archived' | 'deleted';
export interface DataRecord { id: string; dataType: string; stage: LifecycleStage; createdAt: Date; archivedAt?: Date; deletedAt?: Date; }
export class DataLifecycle {
  private records = new Map<string, DataRecord>();
  create(id: string, dataType: string): DataRecord { const record: DataRecord = { id, dataType, stage: 'active', createdAt: new Date() }; this.records.set(id, record); return record; }
  archive(id: string): void { const record = this.records.get(id); if (record) { record.stage = 'archived'; record.archivedAt = new Date(); } }
  delete(id: string): void { const record = this.records.get(id); if (record) { record.stage = 'deleted'; record.deletedAt = new Date(); } }
  getByStage(stage: LifecycleStage): DataRecord[] { return Array.from(this.records.values()).filter(r => r.stage === stage); }
}
export const dataLifecycle = new DataLifecycle();
