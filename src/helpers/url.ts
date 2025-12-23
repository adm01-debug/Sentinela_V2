export const urlHelpers = {
  parse: (url: string): URL => new URL(url),
  getParams: (url: string): Record<string, string> => Object.fromEntries(new URL(url).searchParams),
  setParams: (url: string, params: Record<string, string>): string => {
    const u = new URL(url);
    Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
    return u.toString();
  },
  removeParams: (url: string, keys: string[]): string => {
    const u = new URL(url);
    keys.forEach(k => u.searchParams.delete(k));
    return u.toString();
  },
  join: (...parts: string[]): string => parts.map(p => p.replace(/^\/|\/$/g, '')).join('/'),
  isAbsolute: (url: string): boolean => /^https?:\/\//.test(url),
};
