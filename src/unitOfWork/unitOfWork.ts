import { UnitOfWork, Entity, Repository, EntityState } from './types';
import { EntityTracker } from './entityTracker';

export class DefaultUnitOfWork implements UnitOfWork {
  private tracker: EntityTracker = new EntityTracker();
  private repositories: Map<string, Repository<Entity>> = new Map();
  private isCommitting: boolean = false;

  registerRepository<T extends Entity>(name: string, repository: Repository<T>): void {
    this.repositories.set(name, repository as Repository<Entity>);
  }

  registerNew<T extends Entity>(entity: T): void { this.tracker.track(entity, EntityState.New); }
  registerDirty<T extends Entity>(entity: T): void {
    if (this.tracker.getState(entity) !== EntityState.New) this.tracker.track(entity, EntityState.Dirty);
  }
  registerDeleted<T extends Entity>(entity: T): void {
    const state = this.tracker.getState(entity);
    if (state === EntityState.New) this.tracker.untrack(entity);
    else this.tracker.track(entity, EntityState.Deleted);
  }
  registerClean<T extends Entity>(entity: T): void { this.tracker.track(entity, EntityState.Clean); }

  async commit(): Promise<void> {
    if (this.isCommitting) throw new Error('Commit already in progress');
    this.isCommitting = true;
    try {
      const newEntities = this.tracker.getByState(EntityState.New);
      const dirtyEntities = this.tracker.getByState(EntityState.Dirty);
      const deletedEntities = this.tracker.getByState(EntityState.Deleted);
      for (const tracked of [...newEntities, ...dirtyEntities]) {
        const repo = this.getRepository(tracked.entity);
        await repo.save(tracked.entity);
        this.tracker.track(tracked.entity, EntityState.Clean);
      }
      for (const tracked of deletedEntities) {
        const repo = this.getRepository(tracked.entity);
        await repo.delete(tracked.entity);
        this.tracker.untrack(tracked.entity);
      }
    } finally { this.isCommitting = false; }
  }

  async rollback(): Promise<void> { this.tracker.clear(); }

  private getRepository(entity: Entity): Repository<Entity> {
    const name = entity.constructor.name;
    const repo = this.repositories.get(name);
    if (!repo) throw new Error('No repository for: ' + name);
    return repo;
  }
}
