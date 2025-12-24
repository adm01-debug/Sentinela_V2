import { Migration, MigrationStatus, MigrationConfig } from './types';

export class Migrator {
  private migrations: Migration[] = [];
  private executed: MigrationStatus[] = [];
  private currentBatch: number = 0;
  
  constructor(private config: MigrationConfig) {}
  
  register(migration: Migration): void {
    this.migrations.push(migration);
    this.migrations.sort((a, b) => a.version.localeCompare(b.version));
  }
  
  async migrate(): Promise<string[]> {
    const pending = this.getPendingMigrations();
    this.currentBatch++;
    const executed: string[] = [];
    for (const migration of pending) {
      await migration.up();
      this.executed.push({ version: migration.version, name: migration.name, executedAt: new Date(), batch: this.currentBatch });
      executed.push(migration.name);
    }
    return executed;
  }
  
  async rollback(steps: number = 1): Promise<string[]> {
    const toRollback = this.executed.filter(m => m.batch >= this.currentBatch - steps + 1).reverse();
    const rolledBack: string[] = [];
    for (const status of toRollback) {
      const migration = this.migrations.find(m => m.version === status.version);
      if (migration) { await migration.down(); rolledBack.push(migration.name); }
    }
    this.executed = this.executed.filter(m => !toRollback.includes(m));
    return rolledBack;
  }
  
  async reset(): Promise<string[]> {
    const all = [...this.executed].reverse();
    const rolledBack: string[] = [];
    for (const status of all) {
      const migration = this.migrations.find(m => m.version === status.version);
      if (migration) { await migration.down(); rolledBack.push(migration.name); }
    }
    this.executed = [];
    this.currentBatch = 0;
    return rolledBack;
  }
  
  getPendingMigrations(): Migration[] {
    const executedVersions = new Set(this.executed.map(m => m.version));
    return this.migrations.filter(m => !executedVersions.has(m.version));
  }
  
  getStatus(): MigrationStatus[] { return [...this.executed]; }
}