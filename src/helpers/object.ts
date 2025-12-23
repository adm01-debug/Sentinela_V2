export const objectHelpers = {
  isEmpty: (obj: object): boolean => Object.keys(obj).length === 0,
  keys: <T extends object>(obj: T): (keyof T)[] => Object.keys(obj) as (keyof T)[],
  values: <T extends object>(obj: T): T[keyof T][] => Object.values(obj),
  entries: <T extends object>(obj: T): [keyof T, T[keyof T]][] => Object.entries(obj) as [keyof T, T[keyof T]][],
  merge: <T extends object>(...objects: Partial<T>[]): T => Object.assign({}, ...objects) as T,
  clone: <T extends object>(obj: T): T => JSON.parse(JSON.stringify(obj)),
  equals: (a: object, b: object): boolean => JSON.stringify(a) === JSON.stringify(b),
  hasKey: <T extends object>(obj: T, key: string): key is keyof T => key in obj,
};
