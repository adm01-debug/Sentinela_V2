import { QuerySpecification, QueryCriteria, QueryOperator } from './types';
import { BaseSpecification } from './specification';

export abstract class BaseQuerySpecification<T> extends BaseSpecification<T> implements QuerySpecification<T> {
  abstract toQuery(): QueryCriteria;
  and(other: QuerySpecification<T>): QuerySpecification<T> { return new AndQuerySpec(this, other); }
  or(other: QuerySpecification<T>): QuerySpecification<T> { return new OrQuerySpec(this, other); }
}

export class FieldSpecification<T> extends BaseQuerySpecification<T> {
  constructor(private field: string, private operator: QueryOperator, private value: unknown) { super(); }
  isSatisfiedBy(candidate: T): boolean {
    const v = (candidate as Record<string, unknown>)[this.field];
    switch (this.operator) {
      case 'eq': return v === this.value;
      case 'ne': return v !== this.value;
      case 'gt': return (v as number) > (this.value as number);
      case 'gte': return (v as number) >= (this.value as number);
      case 'lt': return (v as number) < (this.value as number);
      case 'lte': return (v as number) <= (this.value as number);
      case 'in': return (this.value as unknown[]).includes(v);
      case 'like': return String(v).includes(String(this.value));
      default: return false;
    }
  }
  toQuery(): QueryCriteria { return { field: this.field, operator: this.operator, value: this.value }; }
}

class AndQuerySpec<T> extends BaseQuerySpecification<T> {
  constructor(private left: QuerySpecification<T>, private right: QuerySpecification<T>) { super(); }
  isSatisfiedBy(c: T): boolean { return this.left.isSatisfiedBy(c) && this.right.isSatisfiedBy(c); }
  toQuery(): QueryCriteria {
    return { field: '', operator: 'eq', value: null, logicalOperator: 'AND', children: [this.left.toQuery(), this.right.toQuery()] };
  }
}

class OrQuerySpec<T> extends BaseQuerySpecification<T> {
  constructor(private left: QuerySpecification<T>, private right: QuerySpecification<T>) { super(); }
  isSatisfiedBy(c: T): boolean { return this.left.isSatisfiedBy(c) || this.right.isSatisfiedBy(c); }
  toQuery(): QueryCriteria {
    return { field: '', operator: 'eq', value: null, logicalOperator: 'OR', children: [this.left.toQuery(), this.right.toQuery()] };
  }
}

export class QueryBuilder<T> {
  static field<T>(name: string): FieldBuilder<T> { return new FieldBuilder<T>(name); }
}

export class FieldBuilder<T> {
  constructor(private field: string) {}
  eq(value: unknown): FieldSpecification<T> { return new FieldSpecification(this.field, 'eq', value); }
  ne(value: unknown): FieldSpecification<T> { return new FieldSpecification(this.field, 'ne', value); }
  gt(value: number): FieldSpecification<T> { return new FieldSpecification(this.field, 'gt', value); }
  gte(value: number): FieldSpecification<T> { return new FieldSpecification(this.field, 'gte', value); }
  lt(value: number): FieldSpecification<T> { return new FieldSpecification(this.field, 'lt', value); }
  lte(value: number): FieldSpecification<T> { return new FieldSpecification(this.field, 'lte', value); }
  in(values: unknown[]): FieldSpecification<T> { return new FieldSpecification(this.field, 'in', values); }
  like(pattern: string): FieldSpecification<T> { return new FieldSpecification(this.field, 'like', pattern); }
}
