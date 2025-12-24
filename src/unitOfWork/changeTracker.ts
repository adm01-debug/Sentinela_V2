// Change Tracker - Entity Change Detection
export interface ChangeSet<T = unknown> {
  entity: T;
  entityType: string;
  changes: PropertyChange[];
  timestamp: Date;
}

export interface PropertyChange {
  property: string;
  oldValue: unknown;
  newValue: unknown;
}

export class ChangeTracker {
  private snapshots: Map<unknown, Record<string, unknown>> = new Map();

  takeSnapshot<T extends object>(entity: T): void {
    this.snapshots.set(entity, this.getPropertyValues(entity));
  }

  getChanges<T extends object>(entity: T, entityType: string): ChangeSet<T> | null {
    const snapshot = this.snapshots.get(entity);
    if (!snapshot) return null;

    const current = this.getPropertyValues(entity);
    const changes: PropertyChange[] = [];

    for (const [key, oldValue] of Object.entries(snapshot)) {
      const newValue = current[key];
      if (!this.isEqual(oldValue, newValue)) {
        changes.push({ property: key, oldValue, newValue });
      }
    }

    if (changes.length === 0) return null;

    return { entity, entityType, changes, timestamp: new Date() };
  }

  clearSnapshot<T extends object>(entity: T): void {
    this.snapshots.delete(entity);
  }

  hasChanges<T extends object>(entity: T): boolean {
    const snapshot = this.snapshots.get(entity);
    if (!snapshot) return false;
    const current = this.getPropertyValues(entity);
    return !this.isEqual(snapshot, current);
  }

  private getPropertyValues<T extends object>(entity: T): Record<string, unknown> {
    const values: Record<string, unknown> = {};
    for (const key of Object.keys(entity)) {
      values[key] = (entity as Record<string, unknown>)[key];
    }
    return values;
  }

  private isEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (typeof a === "object" && a !== null && b !== null) {
      return JSON.stringify(a) === JSON.stringify(b);
    }
    return false;
  }
}
