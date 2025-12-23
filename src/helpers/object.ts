export const objectHelpers = {
  keys: <T extends object>(obj: T): (keyof T)[] => Object.keys(obj) as (keyof T)[],
  values: <T extends object>(obj: T): T[keyof T][] => Object.values(obj),
  entries: <T extends object>(obj: T): [keyof T, T[keyof T]][] => Object.entries(obj) as [keyof T, T[keyof T]][],
  fromEntries: <K extends string, V>(entries: [K, V][]): Record<K, V> => Object.fromEntries(entries) as Record<K, V>,
  merge: <T extends object>(...objects: Partial<T>[]): T => Object.assign({}, ...objects) as T,
  deepClone: <T>(obj: T): T => JSON.parse(JSON.stringify(obj)),
  isEqual: (a: any, b: any): boolean => JSON.stringify(a) === JSON.stringify(b),
  isEmpty: (obj: object): boolean => Object.keys(obj).length === 0,
};
