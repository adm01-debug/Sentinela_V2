export function truncate(value: string, length: number, suffix = '...'): string { return value.length <= length ? value : value.slice(0, length) + suffix; }
export function truncateMiddle(value: string, length: number): string { if (value.length <= length) return value; const half = Math.floor((length - 3) / 2); return value.slice(0, half) + '...' + value.slice(-half); }
export function truncateWords(value: string, count: number): string { const words = value.split(' '); return words.length <= count ? value : words.slice(0, count).join(' ') + '...'; }
