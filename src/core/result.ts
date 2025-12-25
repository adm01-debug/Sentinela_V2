/**
 * @fileoverview Result/Either pattern implementation
 * @module @sentinela/core
 * @version 13.0.0
 */

export class Ok<T> {
  readonly _tag = 'Ok' as const;
  constructor(readonly value: T) {}

  isOk(): this is Ok<T> { return true; }
  isErr(): this is Err<never> { return false; }

  map<U>(fn: (value: T) => U): Result<U, never> {
    return new Ok(fn(this.value));
  }

  flatMap<U, E>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }

  unwrap(): T { return this.value; }
  unwrapOr(_defaultValue: T): T { return this.value; }
}

export class Err<E> {
  readonly _tag = 'Err' as const;
  constructor(readonly error: E) {}

  isOk(): this is Ok<never> { return false; }
  isErr(): this is Err<E> { return true; }

  map<U>(_fn: (value: never) => U): Result<U, E> {
    return this as unknown as Result<U, E>;
  }

  flatMap<U, E2>(_fn: (value: never) => Result<U, E2>): Result<U, E | E2> {
    return this as unknown as Result<U, E | E2>;
  }

  unwrap(): never { throw this.error; }
  unwrapOr<T>(defaultValue: T): T { return defaultValue; }
}

export type Result<T, E = Error> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> { return new Ok(value); }
export function err<E>(error: E): Err<E> { return new Err(error); }

export function tryCatch<T>(fn: () => T): Result<T, Error> {
  try { return ok(fn()); } 
  catch (e) { return err(e instanceof Error ? e : new Error(String(e))); }
}

export async function tryCatchAsync<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
  try { return ok(await fn()); }
  catch (e) { return err(e instanceof Error ? e : new Error(String(e))); }
}
