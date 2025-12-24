// Specification Repository - Query with Specs
import { Specification } from "./specification";
import { QuerySpecification } from "./querySpecification";

export interface SpecificationRepository<T, ID = string> {
  findAll(): Promise<T[]>;
  findById(id: ID): Promise<T | null>;
  findOne(spec: Specification<T>): Promise<T | null>;
  findMany(spec: Specification<T>): Promise<T[]>;
  count(spec: Specification<T>): Promise<number>;
  exists(spec: Specification<T>): Promise<boolean>;
  query(spec: QuerySpecification<T>): Promise<T[]>;
}

export class InMemorySpecRepository<T extends { id: string }> implements SpecificationRepository<T, string> {
  protected items: Map<string, T> = new Map();

  async findAll(): Promise<T[]> {
    return Array.from(this.items.values());
  }

  async findById(id: string): Promise<T | null> {
    return this.items.get(id) || null;
  }

  async findOne(spec: Specification<T>): Promise<T | null> {
    for (const item of this.items.values()) {
      if (spec.isSatisfiedBy(item)) return item;
    }
    return null;
  }

  async findMany(spec: Specification<T>): Promise<T[]> {
    return Array.from(this.items.values()).filter(item => spec.isSatisfiedBy(item));
  }

  async count(spec: Specification<T>): Promise<number> {
    return (await this.findMany(spec)).length;
  }

  async exists(spec: Specification<T>): Promise<boolean> {
    return (await this.findOne(spec)) !== null;
  }

  async query(spec: QuerySpecification<T>): Promise<T[]> {
    // In-memory implementation evaluates criteria
    const criteria = spec.toCriteria();
    return Array.from(this.items.values()).filter(item => {
      return criteria.every(c => {
        const value = (item as Record<string, unknown>)[c.field];
        switch (c.operator) {
          case "eq": return value === c.value;
          case "neq": return value !== c.value;
          case "gt": return (value as number) > (c.value as number);
          case "gte": return (value as number) >= (c.value as number);
          case "lt": return (value as number) < (c.value as number);
          case "lte": return (value as number) <= (c.value as number);
          case "in": return (c.value as unknown[]).includes(value);
          default: return true;
        }
      });
    });
  }

  async save(item: T): Promise<void> { this.items.set(item.id, item); }
  async delete(id: string): Promise<void> { this.items.delete(id); }
}
