export const objectTransformer = {
  pick: <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    keys.forEach(key => { if (key in obj) result[key] = obj[key]; });
    return result;
  },
  omit: <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach(key => delete (result as any)[key]);
    return result as Omit<T, K>;
  },
  removeNullish: <T extends object>(obj: T): Partial<T> => {
    const result = {} as Partial<T>;
    Object.entries(obj).forEach(([k, v]) => { if (v != null) (result as any)[k] = v; });
    return result;
  },
  flatten: (obj: object, prefix = ''): Record<string, any> => {
    const result: Record<string, any> = {};
    Object.entries(obj).forEach(([k, v]) => {
      const key = prefix ? prefix + '.' + k : k;
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        Object.assign(result, objectTransformer.flatten(v, key));
      } else { result[key] = v; }
    });
    return result;
  },
};
