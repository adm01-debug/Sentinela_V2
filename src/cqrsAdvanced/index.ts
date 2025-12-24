// CQRS Advanced - Main Export
export * from "./commandBus";
export * from "./queryBus";
export * from "./eventStore";
export * from "./aggregateRoot";

import { CommandBus, LoggingMiddleware, ValidationMiddleware } from "./commandBus";
import { QueryBus, CachingMiddleware } from "./queryBus";
import { EventStore } from "./eventStore";

export interface CQRSConfig {
  enableLogging?: boolean;
  enableValidation?: boolean;
  enableQueryCaching?: boolean;
  queryCacheTtl?: number;
  snapshotThreshold?: number;
}

export class CQRSModule {
  readonly commandBus: CommandBus;
  readonly queryBus: QueryBus;
  readonly eventStore: EventStore;

  constructor(config: CQRSConfig = {}) {
    this.commandBus = new CommandBus();
    this.queryBus = new QueryBus();
    this.eventStore = new EventStore({ snapshotThreshold: config.snapshotThreshold });

    if (config.enableValidation !== false) {
      this.commandBus.use(new ValidationMiddleware());
    }
    if (config.enableLogging) {
      this.commandBus.use(new LoggingMiddleware());
    }
    if (config.enableQueryCaching) {
      this.queryBus.use(new CachingMiddleware(config.queryCacheTtl));
    }
  }
}

export const createCQRSModule = (config?: CQRSConfig): CQRSModule => new CQRSModule(config);
