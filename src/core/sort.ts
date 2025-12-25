/**
 * @fileoverview Sorting utilities
 * @module @sentinela/core/sort
 */
export function quickSort<T>(arr: T[], compare: (a: T, b: T) => number = (a, b) => (a as any) - (b as any)): T[] {
  if (arr.length <= 1) return arr;
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => compare(x, pivot) < 0);
  const middle = arr.filter(x => compare(x, pivot) === 0);
  const right = arr.filter(x => compare(x, pivot) > 0);
  return [...quickSort(left, compare), ...middle, ...quickSort(right, compare)];
}
export function mergeSort<T>(arr: T[], compare: (a: T, b: T) => number = (a, b) => (a as any) - (b as any)): T[] {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid), compare);
  const right = mergeSort(arr.slice(mid), compare);
  const result: T[] = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) result.push(compare(left[i], right[j]) <= 0 ? left[i++] : right[j++]);
  return [...result, ...left.slice(i), ...right.slice(j)];
}
