// Unit of Work Pattern - Main Export
export * from "./unitOfWork";
export * from "./transactionManager";
export * from "./changeTracker";
export * from "./repository";

import { BaseUnitOfWork, TrackedEntity } from "./unitOfWork";
import { TransactionManager, InMemoryTransactionManager } from "./transactionManager";
import { BaseRepository } from "./repository";

export class InMemoryUnitOfWork extends BaseUnitOfWork {
  private repositories: Map<string, BaseRepository<any>> = new Map();

  registerRepository<T extends { id: string }>(entityType: string, repository: BaseRepository<T>): void {
    this.repositories.set(entityType, repository);
  }

  async commit(): Promise<void> {
    for (const [entityType, entities] of this.trackedEntities) {
      const repo = this.repositories.get(entityType);
      if (!repo) continue;

      for (const [, tracked] of entities) {
        switch (tracked.state) {
          case "new":
            repo.persistNew(tracked.entity);
            break;
          case "dirty":
            repo.persistUpdate(tracked.entity);
            break;
          case "deleted":
            repo.persistDelete(tracked.entity);
            break;
        }
      }
    }
    this.trackedEntities.clear();
  }
}

export const createUnitOfWork = (): InMemoryUnitOfWork => new InMemoryUnitOfWork();
export const createTransactionManager = (): TransactionManager => new InMemoryTransactionManager();
