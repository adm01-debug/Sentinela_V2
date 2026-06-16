export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> =>
  keys.reduce(
    (acc, key) => {
      if (key in obj) acc[key] = obj[key];
      return acc;
    },
    {} as Pick<T, K>
  );
export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> =>
  Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k as K))) as Omit<T, K>;
export const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));
export const isEqual = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);
export const merge = <T extends object>(...objects: Partial<T>[]): T =>
  Object.assign({}, ...objects) as T;
export const isEmpty = (obj: object) => Object.keys(obj).length === 0;
export const hasKey = <T extends object>(obj: T, key: string | number | symbol): key is keyof T =>
  key in obj;
