export const objectTransformer = {
  pick: <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> =>
    keys.reduce((acc, key) => { if (key in obj) acc[key] = obj[key]; return acc; }, {} as Pick<T, K>),
  omit: <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> =>
    Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k as K))) as Omit<T, K>,
  flatten: (obj: object, prefix = ''): Record<string, any> => {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? prefix + '.' + key : key;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) Object.assign(result, objectTransformer.flatten(value, newKey));
      else result[newKey] = value;
    }
    return result;
  },
  isEmpty: (obj: object): boolean => Object.keys(obj).length === 0,
};
