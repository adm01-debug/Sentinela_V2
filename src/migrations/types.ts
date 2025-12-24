export interface Migration { id: string; name: string; timestamp: number; up: () => Promise<void>; down: () => Promise<void>; }
export interface MigrationRecord { id: string; name: string; executedAt: Date; batch: number; }
export interface MigrationConfig { directory: string; tableName: string; }