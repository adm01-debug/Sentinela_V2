import { MigrationStatus, StranglerRoute } from './types';

export class StranglerMigrator {
  private routes: StranglerRoute[] = [];
  
  setRoutes(routes: StranglerRoute[]): void { this.routes = routes; }
  
  getStatus(): MigrationStatus {
    return {
      totalRoutes: this.routes.length,
      migratedRoutes: this.routes.filter(r => r.target === 'new').length,
      inProgressRoutes: this.routes.filter(r => r.target === 'split').length,
      legacyRoutes: this.routes.filter(r => r.target === 'legacy').length
    };
  }
  
  getMigrationProgress(): number {
    if (this.routes.length === 0) return 100;
    const migrated = this.routes.filter(r => r.target === 'new').length;
    const inProgress = this.routes.filter(r => r.target === 'split').length;
    return Math.round(((migrated + inProgress * 0.5) / this.routes.length) * 100);
  }
  
  suggestNextMigration(): StranglerRoute | undefined {
    return this.routes.find(r => r.target === 'legacy') ?? this.routes.find(r => r.target === 'split');
  }
}