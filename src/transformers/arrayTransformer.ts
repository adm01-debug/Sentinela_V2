export const arrayTransformer = {
  unique: <T>(arr: T[]): T[] => [...new Set(arr)],
  uniqueBy: <T>(arr: T[], key: keyof T): T[] => [...new Map(arr.map(item => [item[key], item])).values()],
  groupBy: <T>(arr: T[], key: keyof T): Record<string, T[]> =>
    arr.reduce((acc, item) => { const k = String(item[key]); (acc[k] = acc[k] || []).push(item); return acc; }, {} as Record<string, T[]>),
  chunk: <T>(arr: T[], size: number): T[][] =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, (i + 1) * size)),
  shuffle: <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5),
  sortBy: <T>(arr: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] =>
    [...arr].sort((a, b) => (a[key] > b[key] ? 1 : -1) * (order === 'asc' ? 1 : -1)),
};
