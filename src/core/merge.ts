/**
 * @fileoverview Deep merge utilities
 * @module @sentinela/core/merge
 */
export function deepMerge<T extends Record<string, unknown>>(target: T, ...sources: Partial<T>[]): T {
  const result = { ...target };
  for (const source of sources) {
    for (const key in source) {
      const sv = source[key], tv = result[key];
      if (typeof sv === 'object' && sv !== null && typeof tv === 'object' && tv !== null && !Array.isArray(sv)) {
        (result as any)[key] = deepMerge(tv as any, sv as any);
      } else if (sv !== undefined) (result as any)[key] = sv;
    }
  }
  return result;
}
export function deepClone<T>(obj: T): T { return JSON.parse(JSON.stringify(obj)); }
