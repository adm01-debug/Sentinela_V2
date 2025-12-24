import { Repository } from './types';

export class CachedRepository<T extends { id: string }> implements Repository<T> {
  private cache: Map<string, { data: T; expiresAt: number }> = new Map();
  
  constructor(private inner: Repository<T>, private ttlMs: number = 60000) {}
  
  async findById(id: string): Promise<T | null> {
    const cached = this.cache.get(id);
    if (cached && cached.expiresAt > Date.now()) return cached.data;
    const data = await this.inner.findById(id);
    if (data) this.cache.set(id, { data, expiresAt: Date.now() + this.ttlMs });
    return data;
  }
  
  async findAll(): Promise<T[]> { return this.inner.findAll(); }
  async save(entity: T): Promise<T> {
    const result = await this.inner.save(entity);
    this.cache.set(entity.id, { data: result, expiresAt: Date.now() + this.ttlMs });
    return result;
  }
  async delete(id: string): Promise<void> { this.cache.delete(id); await this.inner.delete(id); }
  async exists(id: string): Promise<boolean> { return this.inner.exists(id); }
  invalidate(id?: string): void { id ? this.cache.delete(id) : this.cache.clear(); }
}