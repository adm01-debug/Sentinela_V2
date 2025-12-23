export function parseQueryString(query: string): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(query.startsWith('?') ? query.slice(1) : query));
}
export function parseQueryParams<T extends Record<string, any>>(query: string, schema: Record<keyof T, 'string' | 'number' | 'boolean' | 'array'>): T {
  const params = parseQueryString(query);
  const result: any = {};
  for (const [k, type] of Object.entries(schema)) {
    const v = params[k];
    if (v === undefined) continue;
    if (type === 'number') result[k] = Number(v);
    else if (type === 'boolean') result[k] = v === 'true';
    else if (type === 'array') result[k] = v.split(',');
    else result[k] = v;
  }
  return result;
}
