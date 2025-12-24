export interface UnitOfWork {
  registerNew<T extends Entity>(entity: T): void;
  registerDirty<T extends Entity>(entity: T): void;
  registerDeleted<T extends Entity>(entity: T): void;
  registerClean<T extends Entity>(entity: T): void;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export interface Entity { id: string; version?: number; }

export interface Repository<T extends Entity> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<void>;
  delete(entity: T): Promise<void>;
}

export enum EntityState { New = 'new', Clean = 'clean', Dirty = 'dirty', Deleted = 'deleted' }

export interface TrackedEntity<T extends Entity = Entity> {
  entity: T;
  state: EntityState;
  originalValues: Partial<T>;
}
