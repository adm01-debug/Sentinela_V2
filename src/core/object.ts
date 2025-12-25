/**
 * @fileoverview Object utilities
 * @module @sentinela/core/object
 */
export function keys<T extends object>(obj: T): (keyof T)[] { return Object.keys(obj) as (keyof T)[]; }
export function values<T extends object>(obj: T): T[keyof T][] { return Object.values(obj); }
export function entries<T extends object>(obj: T): [keyof T, T[keyof T]][] { return Object.entries(obj) as [keyof T, T[keyof T]][]; }
export function fromEntries<K extends string, V>(entries: [K, V][]): Record<K, V> { return Object.fromEntries(entries) as Record<K, V>; }
export function mapValues<T extends object, R>(obj: T, fn: (value: T[keyof T]) => R): { [K in keyof T]: R } { const result: any = {}; for (const [k, v] of Object.entries(obj)) result[k] = fn(v as T[keyof T]); return result; }
export function filterKeys<T extends object>(obj: T, predicate: (key: keyof T) => boolean): Partial<T> { const result: Partial<T> = {}; for (const k of keys(obj)) if (predicate(k)) result[k] = obj[k]; return result; }
