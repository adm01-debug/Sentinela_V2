export const arrayHelpers = {
  isEmpty: <T>(arr: T[]): boolean => arr.length === 0,
  first: <T>(arr: T[]): T | undefined => arr[0],
  last: <T>(arr: T[]): T | undefined => arr[arr.length - 1],
  random: <T>(arr: T[]): T | undefined => arr[Math.floor(Math.random() * arr.length)],
  shuffle: <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5),
  range: (start: number, end: number): number[] => Array.from({ length: end - start }, (_, i) => start + i),
  sum: (arr: number[]): number => arr.reduce((a, b) => a + b, 0),
  average: (arr: number[]): number => arr.length === 0 ? 0 : arrayHelpers.sum(arr) / arr.length,
  intersection: <T>(a: T[], b: T[]): T[] => a.filter(x => b.includes(x)),
  difference: <T>(a: T[], b: T[]): T[] => a.filter(x => !b.includes(x)),
};
