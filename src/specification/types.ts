export interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
  and(other: Specification<T>): Specification<T>;
  or(other: Specification<T>): Specification<T>;
  not(): Specification<T>;
}

export interface AsyncSpecification<T> {
  isSatisfiedBy(candidate: T): Promise<boolean>;
  and(other: AsyncSpecification<T>): AsyncSpecification<T>;
  or(other: AsyncSpecification<T>): AsyncSpecification<T>;
  not(): AsyncSpecification<T>;
}

export interface QuerySpecification<T> extends Specification<T> {
  toQuery(): QueryCriteria;
}

export interface QueryCriteria {
  field: string;
  operator: QueryOperator;
  value: unknown;
  children?: QueryCriteria[];
  logicalOperator?: 'AND' | 'OR';
}

export type QueryOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'between';
