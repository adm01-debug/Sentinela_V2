/**
 * @fileoverview Assertion utilities
 * @module @sentinela/core/assert
 */
export class AssertionError extends Error { constructor(message: string) { super(message); this.name = 'AssertionError'; } }
export function assert(condition: unknown, message: string = 'Assertion failed'): asserts condition { if (!condition) throw new AssertionError(message); }
export function assertDefined<T>(value: T | undefined | null, message: string = 'Value is undefined'): asserts value is T { if (value === undefined || value === null) throw new AssertionError(message); }
export function assertType<T>(value: unknown, check: (v: unknown) => v is T, message: string = 'Type assertion failed'): asserts value is T { if (!check(value)) throw new AssertionError(message); }
export function assertNever(value: never, message: string = 'Unexpected value'): never { throw new AssertionError(message + ': ' + value); }
