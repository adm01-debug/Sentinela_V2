export function flatten<T>(arr: (T | T[])[]): T[] {
  return arr.reduce<T[]>((acc, val) => acc.concat(Array.isArray(val) ? flatten(val as (T | T[])[]) : val), []);
}
