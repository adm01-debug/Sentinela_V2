// Unit of Work Pattern - Core
export type EntityState = "clean" | "new" | "dirty" | "deleted";

export interface TrackedEntity<T = unknown> {
  entity: T;
  state: EntityState;
  originalValues?: T;
}

export interface UnitOfWork {
  registerNew<T>(entity: T, entityType: string): void;
  registerDirty<T>(entity: T, entityType: string): void;
  registerDeleted<T>(entity: T, entityType: string): void;
  registerClean<T>(entity: T, entityType: string): void;
  commit(): Promise<void>;
  rollback(): void;
  getTracked<T>(entityType: string): TrackedEntity<T>[];
}

export abstract class BaseUnitOfWork implements UnitOfWork {
  protected trackedEntities: Map<string, Map<unknown, TrackedEntity>> = new Map();

  registerNew<T>(entity: T, entityType: string): void {
    this.track(entity, entityType, "new");
  }

  registerDirty<T>(entity: T, entityType: string): void {
    const existing = this.getTrackedEntity(entity, entityType);
    if (existing?.state === "new") return; // New entities stay new
    this.track(entity, entityType, "dirty");
  }

  registerDeleted<T>(entity: T, entityType: string): void {
    const existing = this.getTrackedEntity(entity, entityType);
    if (existing?.state === "new") {
      this.untrack(entity, entityType);
      return;
    }
    this.track(entity, entityType, "deleted");
  }

  registerClean<T>(entity: T, entityType: string): void {
    this.track(entity, entityType, "clean", structuredClone(entity));
  }

  protected track<T>(entity: T, entityType: string, state: EntityState, originalValues?: T): void {
    if (!this.trackedEntities.has(entityType)) {
      this.trackedEntities.set(entityType, new Map());
    }
    this.trackedEntities.get(entityType)!.set(entity, { entity, state, originalValues });
  }

  protected untrack<T>(entity: T, entityType: string): void {
    this.trackedEntities.get(entityType)?.delete(entity);
  }

  protected getTrackedEntity<T>(entity: T, entityType: string): TrackedEntity<T> | undefined {
    return this.trackedEntities.get(entityType)?.get(entity) as TrackedEntity<T> | undefined;
  }

  getTracked<T>(entityType: string): TrackedEntity<T>[] {
    const map = this.trackedEntities.get(entityType);
    return map ? Array.from(map.values()) as TrackedEntity<T>[] : [];
  }

  abstract commit(): Promise<void>;

  rollback(): void {
    for (const [entityType, entities] of this.trackedEntities) {
      for (const [, tracked] of entities) {
        if (tracked.state === "dirty" && tracked.originalValues) {
          Object.assign(tracked.entity as object, tracked.originalValues);
        }
      }
    }
    this.trackedEntities.clear();
  }
}
