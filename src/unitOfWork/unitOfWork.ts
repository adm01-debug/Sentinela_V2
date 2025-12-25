/**
 * @fileoverview Unit of Work pattern implementation
 * @module @sentinela/core/unitOfWork
 * @version 13.0.0
 */

export interface Entity { id: string; }

export interface IUnitOfWork {
  registerNew(entity: Entity): void;
  registerDirty(entity: Entity): void;
  registerDeleted(entity: Entity): void;
  registerClean(entity: Entity): void;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  hasChanges(): boolean;
}

export class UnitOfWork implements IUnitOfWork {
  private newEntities: Entity[] = [];
  private dirtyEntities: Entity[] = [];
  private deletedEntities: Entity[] = [];
  private cleanEntities = new Set<string>();

  registerNew(entity: Entity): void {
    if (!this.cleanEntities.has(entity.id)) {
      this.newEntities.push(entity);
    }
  }

  registerDirty(entity: Entity): void {
    if (!this.newEntities.find(e => e.id === entity.id) &&
        !this.deletedEntities.find(e => e.id === entity.id)) {
      if (!this.dirtyEntities.find(e => e.id === entity.id)) {
        this.dirtyEntities.push(entity);
      }
    }
  }

  registerDeleted(entity: Entity): void {
    const newIdx = this.newEntities.findIndex(e => e.id === entity.id);
    if (newIdx >= 0) {
      this.newEntities.splice(newIdx, 1);
      return;
    }
    const dirtyIdx = this.dirtyEntities.findIndex(e => e.id === entity.id);
    if (dirtyIdx >= 0) {
      this.dirtyEntities.splice(dirtyIdx, 1);
    }
    if (!this.deletedEntities.find(e => e.id === entity.id)) {
      this.deletedEntities.push(entity);
    }
  }

  registerClean(entity: Entity): void {
    this.cleanEntities.add(entity.id);
  }

  hasChanges(): boolean {
    return this.newEntities.length > 0 ||
           this.dirtyEntities.length > 0 ||
           this.deletedEntities.length > 0;
  }

  async commit(): Promise<void> {
    // Insert new entities
    for (const entity of this.newEntities) {
      this.cleanEntities.add(entity.id);
    }
    // Update dirty entities
    for (const entity of this.dirtyEntities) {
      this.cleanEntities.add(entity.id);
    }
    // Delete removed entities
    for (const entity of this.deletedEntities) {
      this.cleanEntities.delete(entity.id);
    }
    this.clear();
  }

  async rollback(): Promise<void> {
    this.clear();
  }

  private clear(): void {
    this.newEntities = [];
    this.dirtyEntities = [];
    this.deletedEntities = [];
  }

  getNewEntities(): Entity[] { return [...this.newEntities]; }
  getDirtyEntities(): Entity[] { return [...this.dirtyEntities]; }
  getDeletedEntities(): Entity[] { return [...this.deletedEntities]; }
}
