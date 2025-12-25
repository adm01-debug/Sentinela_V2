/**
 * @fileoverview Set utilities
 * @module @sentinela/core/set
 */
export function union<T>(a: Set<T>, b: Set<T>): Set<T> { return new Set([...a, ...b]); }
export function intersection<T>(a: Set<T>, b: Set<T>): Set<T> { return new Set([...a].filter(x => b.has(x))); }
export function difference<T>(a: Set<T>, b: Set<T>): Set<T> { return new Set([...a].filter(x => !b.has(x))); }
export function symmetricDifference<T>(a: Set<T>, b: Set<T>): Set<T> { return new Set([...difference(a, b), ...difference(b, a)]); }
export function isSubset<T>(a: Set<T>, b: Set<T>): boolean { return [...a].every(x => b.has(x)); }
export function isSuperset<T>(a: Set<T>, b: Set<T>): boolean { return isSubset(b, a); }
export function isDisjoint<T>(a: Set<T>, b: Set<T>): boolean { return intersection(a, b).size === 0; }
