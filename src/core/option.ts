/**
 * @fileoverview Option/Maybe pattern implementation
 * @module @sentinela/core
 * @version 13.0.0
 */

export class Some<T> {
  readonly _tag = 'Some' as const;
  constructor(readonly value: T) {}

  isSome(): this is Some<T> { return true; }
  isNone(): this is None { return false; }

  map<U>(fn: (value: T) => U): Option<U> { return some(fn(this.value)); }
  flatMap<U>(fn: (value: T) => Option<U>): Option<U> { return fn(this.value); }
  filter(predicate: (value: T) => boolean): Option<T> {
    return predicate(this.value) ? this : none();
  }

  unwrap(): T { return this.value; }
  unwrapOr(_defaultValue: T): T { return this.value; }
  unwrapOrElse(_fn: () => T): T { return this.value; }
}

export class None {
  readonly _tag = 'None' as const;

  isSome(): this is Some<never> { return false; }
  isNone(): this is None { return true; }

  map<U>(_fn: (value: never) => U): Option<U> { return this as unknown as Option<U>; }
  flatMap<U>(_fn: (value: never) => Option<U>): Option<U> { return this as unknown as Option<U>; }
  filter(_predicate: (value: never) => boolean): Option<never> { return this; }

  unwrap(): never { throw new Error('Called unwrap on None'); }
  unwrapOr<T>(defaultValue: T): T { return defaultValue; }
  unwrapOrElse<T>(fn: () => T): T { return fn(); }
}

export type Option<T> = Some<T> | None;

const NONE = new None();

export function some<T>(value: T): Some<T> { return new Some(value); }
export function none(): None { return NONE; }

export function fromNullable<T>(value: T | null | undefined): Option<T> {
  return value == null ? none() : some(value);
}

export function fromPredicate<T>(value: T, predicate: (v: T) => boolean): Option<T> {
  return predicate(value) ? some(value) : none();
}
