import { Entity, EntityState, TrackedEntity } from './types';

export class EntityTracker {
  private entities: Map<string, TrackedEntity> = new Map();

  track<T extends Entity>(entity: T, state: EntityState): void {
    const key = this.getKey(entity);
    const existing = this.entities.get(key);
    this.entities.set(key, { entity, state, originalValues: existing?.originalValues ?? { ...entity } });
  }

  untrack<T extends Entity>(entity: T): void { this.entities.delete(this.getKey(entity)); }
  getState<T extends Entity>(entity: T): EntityState | null { return this.entities.get(this.getKey(entity))?.state ?? null; }
  getByState(state: EntityState): TrackedEntity[] { return Array.from(this.entities.values()).filter(t => t.state === state); }
  
  getChanges<T extends Entity>(entity: T): Partial<T> | null {
    const tracked = this.entities.get(this.getKey(entity));
    if (!tracked) return null;
    const changes: Partial<T> = {};
    for (const key of Object.keys(entity)) {
      if ((entity as Record<string, unknown>)[key] !== (tracked.originalValues as Record<string, unknown>)[key]) {
        (changes as Record<string, unknown>)[key] = (entity as Record<string, unknown>)[key];
      }
    }
    return Object.keys(changes).length > 0 ? changes : null;
  }

  clear(): void { this.entities.clear(); }
  private getKey(entity: Entity): string { return entity.constructor.name + ':' + entity.id; }
}
