export function isValidUrl(url: string): boolean { try { new URL(url); return true; } catch { return false; } }
export function isHttps(url: string): boolean { try { return new URL(url).protocol === 'https:'; } catch { return false; } }
export function getDomain(url: string): string | null { try { return new URL(url).hostname; } catch { return null; } }
export function isInternalUrl(url: string, baseDomain: string): boolean { const domain = getDomain(url); return domain === baseDomain || domain?.endsWith('.' + baseDomain) || false; }
