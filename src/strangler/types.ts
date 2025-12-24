export interface StranglerConfig {
  legacyEndpoint: string;
  newEndpoint: string;
  routes: StranglerRoute[];
}

export interface StranglerRoute {
  path: string;
  target: 'legacy' | 'new' | 'split';
  splitRatio?: number;
}

export interface MigrationStatus {
  totalRoutes: number;
  migratedRoutes: number;
  inProgressRoutes: number;
  legacyRoutes: number;
}