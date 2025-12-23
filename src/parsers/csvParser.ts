export function parseCSV<T = Record<string, string>>(csv: string, hasHeader = true): T[] {
  const lines = csv.trim().split('\n').map(l => l.split(',').map(c => c.trim().replace(/^"|"$/g, '')));
  if (!hasHeader) return lines.map(l => l as unknown as T);
  const headers = lines[0];
  return lines.slice(1).map(l => headers.reduce((obj, h, i) => ({ ...obj, [h]: l[i] }), {} as T));
}
export function toCSV<T extends Record<string, any>>(data: T[], headers?: string[]): string {
  const keys = headers || Object.keys(data[0] || {});
  const rows = data.map(row => keys.map(k => '"' + String(row[k] ?? '').replace(/"/g, '""') + '"').join(','));
  return [keys.join(','), ...rows].join('\n');
}
