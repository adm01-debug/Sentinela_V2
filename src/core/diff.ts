/**
 * @fileoverview Diff utilities
 * @module @sentinela/core/diff
 */
export interface Change { type: 'add' | 'remove' | 'change'; path: string; oldValue?: unknown; newValue?: unknown; }
export function diffObjects(a: Record<string, unknown>, b: Record<string, unknown>, path: string = ''): Change[] {
  const changes: Change[] = [];
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of allKeys) {
    const p = path ? path + '.' + key : key;
    if (!(key in a)) changes.push({ type: 'add', path: p, newValue: b[key] });
    else if (!(key in b)) changes.push({ type: 'remove', path: p, oldValue: a[key] });
    else if (typeof a[key] === 'object' && typeof b[key] === 'object' && a[key] && b[key]) changes.push(...diffObjects(a[key] as any, b[key] as any, p));
    else if (a[key] !== b[key]) changes.push({ type: 'change', path: p, oldValue: a[key], newValue: b[key] });
  }
  return changes;
}
