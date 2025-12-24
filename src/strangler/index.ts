// Strangler Fig Pattern - Main Export
export * from "./stranglerFacade";
export * from "./migrationManager";
export * from "./featureToggle";
export * from "./antiCorruption";

import { StranglerFacade, RouteConfig } from "./stranglerFacade";
import { MigrationManager } from "./migrationManager";
import { FeatureToggleManager } from "./featureToggle";

export interface StranglerConfig {
  routes: RouteConfig[];
}

export class StranglerApplication {
  readonly facade = new StranglerFacade();
  readonly migrations = new MigrationManager();
  readonly features = new FeatureToggleManager();

  constructor(config?: StranglerConfig) {
    if (config?.routes) {
      for (const route of config.routes) {
        this.facade.addRoute(route);
      }
    }
  }
}

export const createStranglerApp = (config?: StranglerConfig) => new StranglerApplication(config);
