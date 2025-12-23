export const urlHelpers = {
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
  getPath: (url: string): string => new URL(url).pathname,
  getHost: (url: string): string => new URL(url).hostname,
  isAbsolute: (url: string): boolean => url.startsWith('http://') || url.startsWith('https://'),
  join: (...parts: string[]): string => parts.map(p => p.replace(/^\/|\/$/g, '')).filter(Boolean).join('/'),
};
