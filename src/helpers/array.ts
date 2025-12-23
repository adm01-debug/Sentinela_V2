export const arrayHelpers = {
  first: <T>(arr: T[]): T | undefined => arr[0],
  last: <T>(arr: T[]): T | undefined => arr[arr.length - 1],
  isEmpty: <T>(arr: T[]): boolean => arr.length === 0,
  range: (start: number, end: number): number[] => Array.from({ length: end - start }, (_, i) => start + i),
  sum: (arr: number[]): number => arr.reduce((a, b) => a + b, 0),
  average: (arr: number[]): number => arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length,
  min: (arr: number[]): number => Math.min(...arr),
  max: (arr: number[]): number => Math.max(...arr),
  compact: <T>(arr: (T | null | undefined)[]): T[] => arr.filter((x): x is T => x != null),
  intersection: <T>(a: T[], b: T[]): T[] => a.filter(x => b.includes(x)),
  difference: <T>(a: T[], b: T[]): T[] => a.filter(x => !b.includes(x)),
};
