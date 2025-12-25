/**
 * @fileoverview Strangler fig pattern types
 * @module @sentinela/core/strangler
 * @version 13.0.0
 */

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