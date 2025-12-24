import { Repository } from './types';

export abstract class BaseRepository<T extends { id: string }> implements Repository<T> {
  protected items: Map<string, T> = new Map();
  
  async findById(id: string): Promise<T | null> { return this.items.get(id) ?? null; }
  async findAll(): Promise<T[]> { return Array.from(this.items.values()); }
  async save(entity: T): Promise<T> { this.items.set(entity.id, entity); return entity; }
  async delete(id: string): Promise<void> { this.items.delete(id); }
  async exists(id: string): Promise<boolean> { return this.items.has(id); }
}

export class InMemoryRepository<T extends { id: string }> extends BaseRepository<T> {}