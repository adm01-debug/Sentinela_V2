export function parseUrl(url: string): URL | null { try { return new URL(url); } catch { return null; } }
export function parseUrlParts(url: string) { const u = parseUrl(url); if (!u) return null; return { protocol: u.protocol, host: u.host, pathname: u.pathname, search: u.search, hash: u.hash, params: Object.fromEntries(u.searchParams) }; }
export function isValidUrl(url: string): boolean { return parseUrl(url) !== null; }
