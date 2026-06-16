// URL utilities for Sentinela v17

export function buildUrl(
  base: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  if (!params) return base;
  const url = new URL(base, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

export function parseUrl(url): URL | null {
  try {
    return new URL(url, window.location.origin);
  } catch {
    return null;
  }
}

export function getQueryParams(url?: string): Record<string, string> {
  const searchParams = url
    ? new URL(url, window.location.origin).searchParams
    : new URLSearchParams(window.location.search);
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

export function updateQueryParam(key: string, value: string | null, url?: string): string {
  const currentUrl = url ? new URL(url, window.location.origin) : new URL(window.location.href);
  if (value === null) {
    currentUrl.searchParams.delete(key);
  } else {
    currentUrl.searchParams.set(key, value);
  }
  return currentUrl.toString();
}

export function removeQueryParams(keys: string[], url?: string): string {
  const currentUrl = url ? new URL(url, window.location.origin) : new URL(window.location.href);
  keys.forEach((key) => currentUrl.searchParams.delete(key));
  return currentUrl.toString();
}

export function isAbsoluteUrl(url): boolean {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url);
}

export function isValidUrl(url): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function joinPaths(...paths: string[]): string {
  return paths
    .map((path, index) => {
      if (index === 0) return path.replace(/\/+$/, "");
      if (index === paths.length - 1) return path.replace(/^\/+/, "");
      return path.replace(/^\/+|\/+$/g, "");
    })
    .filter(Boolean)
    .join("/");
}

export function getPathSegments(url): string[] {
  const parsed = parseUrl(url);
  if (!parsed) return [];
  return parsed.pathname.split("/").filter(Boolean);
}

export function getDomain(url): string | null {
  const parsed = parseUrl(url);
  return parsed?.hostname || null;
}

export function getProtocol(url): string | null {
  const parsed = parseUrl(url);
  return parsed?.protocol.replace(":", "") || null;
}

export function normalizeUrl(url): string {
  const parsed = parseUrl(url);
  if (!parsed) return url;
  parsed.pathname = parsed.pathname.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
  return parsed.toString();
}
