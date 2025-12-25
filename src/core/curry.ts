/**
 * @fileoverview Curry utilities
 * @module @sentinela/core/curry
 */
export function curry<T extends (...args: unknown[]) => unknown>(fn: T): (...args: unknown[]) => unknown {
  return function curried(...args: unknown[]): unknown {
    if (args.length >= fn.length) return fn(...args);
    return (...more: unknown[]) => curried(...args, ...more);
  };
}
export function partial<T extends (...args: unknown[]) => unknown>(fn: T, ...partialArgs: unknown[]): (...args: unknown[]) => ReturnType<T> {
  return (...args: unknown[]) => fn(...partialArgs, ...args) as ReturnType<T>;
}
