import { Specification, AsyncSpecification } from './types';

export abstract class BaseSpecification<T> implements Specification<T> {
  abstract isSatisfiedBy(candidate: T): boolean;
  and(other: Specification<T>): Specification<T> { return new AndSpecification(this, other); }
  or(other: Specification<T>): Specification<T> { return new OrSpecification(this, other); }
  not(): Specification<T> { return new NotSpecification(this); }
}

export class AndSpecification<T> extends BaseSpecification<T> {
  constructor(private left: Specification<T>, private right: Specification<T>) { super(); }
  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate);
  }
}

export class OrSpecification<T> extends BaseSpecification<T> {
  constructor(private left: Specification<T>, private right: Specification<T>) { super(); }
  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate);
  }
}

export class NotSpecification<T> extends BaseSpecification<T> {
  constructor(private spec: Specification<T>) { super(); }
  isSatisfiedBy(candidate: T): boolean { return !this.spec.isSatisfiedBy(candidate); }
}

export abstract class BaseAsyncSpecification<T> implements AsyncSpecification<T> {
  abstract isSatisfiedBy(candidate: T): Promise<boolean>;
  and(other: AsyncSpecification<T>): AsyncSpecification<T> { return new AsyncAndSpec(this, other); }
  or(other: AsyncSpecification<T>): AsyncSpecification<T> { return new AsyncOrSpec(this, other); }
  not(): AsyncSpecification<T> { return new AsyncNotSpec(this); }
}

class AsyncAndSpec<T> extends BaseAsyncSpecification<T> {
  constructor(private left: AsyncSpecification<T>, private right: AsyncSpecification<T>) { super(); }
  async isSatisfiedBy(c: T): Promise<boolean> {
    const [l, r] = await Promise.all([this.left.isSatisfiedBy(c), this.right.isSatisfiedBy(c)]);
    return l && r;
  }
}

class AsyncOrSpec<T> extends BaseAsyncSpecification<T> {
  constructor(private left: AsyncSpecification<T>, private right: AsyncSpecification<T>) { super(); }
  async isSatisfiedBy(c: T): Promise<boolean> {
    const [l, r] = await Promise.all([this.left.isSatisfiedBy(c), this.right.isSatisfiedBy(c)]);
    return l || r;
  }
}

class AsyncNotSpec<T> extends BaseAsyncSpecification<T> {
  constructor(private spec: AsyncSpecification<T>) { super(); }
  async isSatisfiedBy(c: T): Promise<boolean> { return !(await this.spec.isSatisfiedBy(c)); }
}
