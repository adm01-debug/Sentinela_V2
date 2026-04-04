export const unique = <T>(arr: T[]) => [...new Set(arr)];
export const chunk = <T>(arr: T[], size) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));
export const shuffle = <T>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
export const groupBy = <T>(arr: T[], key: keyof T) => arr.reduce((acc, item) => { const k = String(item[key]); (acc[k] ||= []).push(item); return acc; }, {} as Record<string, T[]>);
export const sortBy = <T>(arr: T[], key: keyof T, order: 'asc' | 'desc' = 'asc') => [...arr].sort((a, b) => { const va = a[key], vb = b[key]; const cmp = va < vb ? -1 : va > vb ? 1 : 0; return order === 'asc' ? cmp : -cmp; });
export const last = <T>(arr: T[]) => arr[arr.length - 1];
export const range = (start, end) => Array.from({ length: end - start }, (_, i) => start + i);
