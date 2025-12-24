import { QueryRepository, QueryCriteria, PagedResult } from './types';

export class InMemoryQueryRepository<T extends { id: string }> implements QueryRepository<T> {
  protected items: Map<string, T> = new Map();
  
  async findBy(criteria: QueryCriteria<T>): Promise<T[]> {
    let results = Array.from(this.items.values());
    if (criteria.where) {
      results = results.filter(item => {
        return Object.entries(criteria.where!).every(([k, v]) => (item as any)[k] === v);
      });
    }
    if (criteria.orderBy) {
      results.sort((a, b) => {
        for (const order of criteria.orderBy!) {
          const aVal = (a as any)[order.field];
          const bVal = (b as any)[order.field];
          if (aVal !== bVal) return order.direction === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
        }
        return 0;
      });
    }
    if (criteria.skip) results = results.slice(criteria.skip);
    if (criteria.take) results = results.slice(0, criteria.take);
    return results;
  }
  
  async findOne(criteria: QueryCriteria<T>): Promise<T | null> {
    const results = await this.findBy({ ...criteria, take: 1 });
    return results[0] ?? null;
  }
  
  async count(criteria?: QueryCriteria<T>): Promise<number> {
    if (!criteria?.where) return this.items.size;
    return (await this.findBy({ where: criteria.where })).length;
  }
  
  async findPaged(criteria: QueryCriteria<T>, page: number, pageSize: number): Promise<PagedResult<T>> {
    const total = await this.count(criteria);
    const items = await this.findBy({ ...criteria, skip: (page - 1) * pageSize, take: pageSize });
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
}