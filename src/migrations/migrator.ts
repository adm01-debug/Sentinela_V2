import { Migration, MigrationRecord, MigrationConfig } from './types';

export class Migrator {
  private migrations: Migration[] = [];
  private executed: MigrationRecord[] = [];
  private batch: number = 0;
  
  constructor(private config: MigrationConfig) {}
  
  register(migration: Migration): void { this.migrations.push(migration); }
  
  async migrate(): Promise<MigrationResult> {
    const pending = this.getPending();
    this.batch++;
    const result: MigrationResult = { migrated: [], failed: [] };
    
    for (const migration of pending) {
      try {
        await migration.up();
        this.executed.push({ id: migration.id, name: migration.name, executedAt: new Date(), batch: this.batch });
        result.migrated.push(migration.name);
      } catch (e) {
        result.failed.push({ name: migration.name, error: (e as Error).message });
        break;
      }
    }
    return result;
  }
  
  async rollback(): Promise<MigrationResult> {
    const lastBatch = this.executed.filter(m => m.batch === this.batch);
    const result: MigrationResult = { migrated: [], failed: [] };
    
    for (const record of lastBatch.reverse()) {
      const migration = this.migrations.find(m => m.id === record.id);
      if (migration) {
        try {
          await migration.down();
          this.executed = this.executed.filter(e => e.id !== record.id);
          result.migrated.push(migration.name);
        } catch (e) {
          result.failed.push({ name: migration.name, error: (e as Error).message });
        }
      }
    }
    return result;
  }
  
  getPending(): Migration[] {
    const executedIds = new Set(this.executed.map(e => e.id));
    return this.migrations.filter(m => !executedIds.has(m.id)).sort((a, b) => a.timestamp - b.timestamp);
  }
  
  getExecuted(): MigrationRecord[] { return [...this.executed]; }
}

export interface MigrationResult { migrated: string[]; failed: { name: string; error: string }[]; }