// Deep clone/merge utilities for Sentinela v17

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as T;
  }

  if (obj instanceof Map) {
    const clonedMap = new Map();
    obj.forEach((value, key) => {
      clonedMap.set(deepClone(key), deepClone(value));
    });
    return clonedMap as T;
  }

  if (obj instanceof Set) {
    const clonedSet = new Set();
    obj.forEach((value) => {
      clonedSet.add(deepClone(value));
    });
    return clonedSet as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as T;
  }

  if (obj instanceof Object) {
    const clonedObj: Record<string, unknown> = {};
    Object.keys(obj).forEach((key) => {
      clonedObj[key] = deepClone((obj as Record<string, unknown>)[key]);
    });
    return clonedObj as T;
  }

  return obj;
}

export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target;

  const source = sources.shift();
  if (!source) return deepMerge(target, ...sources);

  const result = { ...target };

  Object.keys(source).forEach((key) => {
    const targetValue = result[key as keyof T];
    const sourceValue = source[key as keyof T];

    if (isObject(targetValue) && isObject(sourceValue)) {
      (result as Record<string, unknown>)[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      );
    } else if (sourceValue !== undefined) {
      (result as Record<string, unknown>)[key] = deepClone(sourceValue);
    }
  });

  return deepMerge(result, ...sources);
}

function isObject(item: unknown): item is Record<string, unknown> {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  if (isObject(a) && isObject(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) => deepEqual(a[key], b[key]));
  }

  return false;
}

export function deepFreeze<T extends Record<string, unknown>>(obj: T): Readonly<T> {
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (isObject(value)) {
      deepFreeze(value);
    }
  });
  return Object.freeze(obj);
}

export function deepDiff<T extends Record<string, unknown>>(
  original: T,
  modified: T
): Partial<T> {
  const diff: Partial<T> = {};

  const allKeys = new Set([...Object.keys(original), ...Object.keys(modified)]);

  allKeys.forEach((key) => {
    const origValue = original[key as keyof T];
    const modValue = modified[key as keyof T];

    if (!deepEqual(origValue, modValue)) {
      (diff as Record<string, unknown>)[key] = modValue;
    }
  });

  return diff;
}

export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result as Omit<T, K>;
}
