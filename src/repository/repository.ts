/**
 * @fileoverview Repository pattern implementation
 * @module @sentinela/core/repository
 * @version 13.0.0
 */

import { Specification } from '../specification/specification';

export interface Entity {
  id: string;
}

export interface IRepository<T extends Entity> {
  findById(id: string): Promise<T | undefined>;
  findAll(): Promise<T[]>;
  findBySpec(spec: Specification<T>): Promise<T[]>;
  save(entity: T): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}

export class InMemoryRepository<T extends Entity> implements IRepository<T> {
  protected store = new Map<string, T>();

  async findById(id: string): Promise<T | undefined> {
    return this.store.get(id);
  }

  async findAll(): Promise<T[]> {
    return Array.from(this.store.values());
  }

  async findBySpec(spec: Specification<T>): Promise<T[]> {
    return Array.from(this.store.values()).filter(e => spec.isSatisfiedBy(e));
  }

  async save(entity: T): Promise<void> {
    this.store.set(entity.id, entity);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.store.has(id);
  }

  clear(): void {
    this.store.clear();
  }
}

export class Repository<T extends Entity> extends InMemoryRepository<T> {}
