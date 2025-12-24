import { Specification } from './types';
import { BaseSpecification } from './specification';

export class CompositeSpecification<T> extends BaseSpecification<T> {
  private specs: Specification<T>[] = [];
  private mode: 'all' | 'any' | 'none';
  constructor(mode: 'all' | 'any' | 'none' = 'all') { super(); this.mode = mode; }
  add(spec: Specification<T>): this { this.specs.push(spec); return this; }
  isSatisfiedBy(candidate: T): boolean {
    if (this.specs.length === 0) return true;
    switch (this.mode) {
      case 'all': return this.specs.every(s => s.isSatisfiedBy(candidate));
      case 'any': return this.specs.some(s => s.isSatisfiedBy(candidate));
      case 'none': return !this.specs.some(s => s.isSatisfiedBy(candidate));
    }
  }
  static all<T>(...specs: Specification<T>[]): CompositeSpecification<T> {
    const c = new CompositeSpecification<T>('all');
    specs.forEach(s => c.add(s)); return c;
  }
  static any<T>(...specs: Specification<T>[]): CompositeSpecification<T> {
    const c = new CompositeSpecification<T>('any');
    specs.forEach(s => c.add(s)); return c;
  }
}

export class PropertySpecification<T, K extends keyof T> extends BaseSpecification<T> {
  constructor(private property: K, private expected: T[K]) { super(); }
  isSatisfiedBy(candidate: T): boolean { return candidate[this.property] === this.expected; }
}

export class RangeSpecification<T, K extends keyof T> extends BaseSpecification<T> {
  constructor(private property: K, private min: T[K], private max: T[K]) { super(); }
  isSatisfiedBy(candidate: T): boolean {
    const value = candidate[this.property];
    return value >= this.min && value <= this.max;
  }
}
