// Repository with Unit of Work
import { UnitOfWork } from "./unitOfWork";
import { ChangeTracker } from "./changeTracker";

export interface Repository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): void;
  delete(entity: T): void;
}

export abstract class BaseRepository<T extends { id: string }> implements Repository<T, string> {
  protected entities: Map<string, T> = new Map();
  protected changeTracker: ChangeTracker = new ChangeTracker();

  constructor(protected unitOfWork: UnitOfWork, protected entityType: string) {}

  async findById(id: string): Promise<T | null> {
    const entity = this.entities.get(id);
    if (entity) {
      this.changeTracker.takeSnapshot(entity);
      this.unitOfWork.registerClean(entity, this.entityType);
    }
    return entity || null;
  }

  async findAll(): Promise<T[]> {
    const all = Array.from(this.entities.values());
    for (const entity of all) {
      this.changeTracker.takeSnapshot(entity);
      this.unitOfWork.registerClean(entity, this.entityType);
    }
    return all;
  }

  save(entity: T): void {
    if (this.entities.has(entity.id)) {
      if (this.changeTracker.hasChanges(entity)) {
        this.unitOfWork.registerDirty(entity, this.entityType);
      }
    } else {
      this.unitOfWork.registerNew(entity, this.entityType);
    }
  }

  delete(entity: T): void {
    this.unitOfWork.registerDeleted(entity, this.entityType);
  }

  // Called by UnitOfWork during commit
  persistNew(entity: T): void {
    this.entities.set(entity.id, entity);
    this.changeTracker.takeSnapshot(entity);
  }

  persistUpdate(entity: T): void {
    this.entities.set(entity.id, entity);
    this.changeTracker.takeSnapshot(entity);
  }

  persistDelete(entity: T): void {
    this.entities.delete(entity.id);
    this.changeTracker.clearSnapshot(entity);
  }
}
