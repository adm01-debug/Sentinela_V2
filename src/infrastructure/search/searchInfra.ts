export class SearchInfra {
  search<T>(items: T[], query: string, fields: (keyof T)[]): T[] { const q = query.toLowerCase(); return items.filter(item => fields.some(f => String(item[f]).toLowerCase().includes(q))); }
  filter<T>(items: T[], filters: Partial<T>): T[] { return items.filter(item => Object.entries(filters).every(([k, v]) => item[k as keyof T] === v)); }
  sort<T>(items: T[], field: keyof T, order: 'asc' | 'desc' = 'asc'): T[] { return [...items].sort((a, b) => { const va = a[field], vb = b[field]; const cmp = va < vb ? -1 : va > vb ? 1 : 0; return order === 'asc' ? cmp : -cmp; }); }
  paginate<T>(items: T[], page: number, limit: number): { data: T[]; total: number } { return { data: items.slice((page - 1) * limit, page * limit), total: items.length }; }
}
export const searchInfra = new SearchInfra();
