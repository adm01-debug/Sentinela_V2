/**
 * @fileoverview Search utilities
 * @module @sentinela/core/search
 */
export function binarySearch<T>(arr: T[], target: T, compare: (a: T, b: T) => number = (a, b) => (a as any) - (b as any)): number {
  let left = 0, right = arr.length - 1;
  while (left <= right) { const mid = Math.floor((left + right) / 2); const cmp = compare(arr[mid], target); if (cmp === 0) return mid; if (cmp < 0) left = mid + 1; else right = mid - 1; }
  return -1;
}
export function lowerBound<T>(arr: T[], target: T, compare: (a: T, b: T) => number = (a, b) => (a as any) - (b as any)): number {
  let left = 0, right = arr.length;
  while (left < right) { const mid = Math.floor((left + right) / 2); if (compare(arr[mid], target) < 0) left = mid + 1; else right = mid; }
  return left;
}
export function upperBound<T>(arr: T[], target: T, compare: (a: T, b: T) => number = (a, b) => (a as any) - (b as any)): number {
  let left = 0, right = arr.length;
  while (left < right) { const mid = Math.floor((left + right) / 2); if (compare(arr[mid], target) <= 0) left = mid + 1; else right = mid; }
  return left;
}
