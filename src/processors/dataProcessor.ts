export const dataProcessor = {
  normalize: <T extends Record<string, any>>(data: T[]): T[] => data.map(item => Object.fromEntries(Object.entries(item).map(([k, v]) => [k, v ?? null])) as T),
  deduplicate: <T>(data: T[], key: keyof T): T[] => { const seen = new Set(); return data.filter(item => { const val = item[key]; if (seen.has(val)) return false; seen.add(val); return true; }); },
  sort: <T>(data: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => [...data].sort((a, b) => { const va = a[key], vb = b[key]; const cmp = va < vb ? -1 : va > vb ? 1 : 0; return order === 'asc' ? cmp : -cmp; }),
  filter: <T>(data: T[], predicate: (item: T) => boolean): T[] => data.filter(predicate),
  group: <T>(data: T[], key: keyof T): Record<string, T[]> => data.reduce((acc, item) => { const k = String(item[key]); acc[k] = acc[k] || []; acc[k].push(item); return acc; }, {} as Record<string, T[]>),
};
