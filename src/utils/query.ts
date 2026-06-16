// Query utilities for Sentinela v17

export interface QueryParams {
  [key: string]: string | number | boolean | string[] | undefined | null;
}

export function stringify(params: QueryParams): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, String(v)));
    } else {
      searchParams.set(key, String(value));
    }
  });
  return searchParams.toString();
}

export function parse(queryString): Record<string, string | string[]> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string | string[]> = {};
  params.forEach((value, key) => {
    const existing = result[key];
    if (existing !== undefined) {
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        result[key] = [existing, value];
      }
    } else {
      result[key] = value;
    }
  });
  return result;
}

export function get(key: string, defaultValue?: string): string | undefined {
  const params = new URLSearchParams(window.location.search);
  return params.get(key) ?? defaultValue;
}

export function getAll(key): string[] {
  const params = new URLSearchParams(window.location.search);
  return params.getAll(key);
}

export function has(key): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.has(key);
}

export function set(key: string, value: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);
  window.history.replaceState({}, "", url.toString());
}

export function remove(key): void {
  const url = new URL(window.location.href);
  url.searchParams.delete(key);
  window.history.replaceState({}, "", url.toString());
}

export function clear(): void {
  const url = new URL(window.location.href);
  url.search = "";
  window.history.replaceState({}, "", url.toString());
}

export function merge(newParams: QueryParams): string {
  const current = parse(window.location.search);
  return stringify({ ...current, ...newParams });
}

export function toObject<T extends Record<string, unknown>>(): T {
  const params = parse(window.location.search);
  return params as T;
}

export const query = {
  stringify,
  parse,
  get,
  getAll,
  has,
  set,
  remove,
  clear,
  merge,
  toObject,
};

export default query;
