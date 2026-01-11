export const formatNumber = (num: number, locale = 'en-US') => new Intl.NumberFormat(locale).format(num);
export const formatCurrency = (amount: number, currency = 'USD', locale = 'en-US') => new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
export const formatPercent = (value: number, decimals = 1) => value.toFixed(decimals) + '%';
export const formatBytes = (bytes: number) => { const units = ['B', 'KB', 'MB', 'GB', 'TB']; let i = 0; while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++; } return bytes.toFixed(1) + ' ' + units[i]; };
export const roundTo = (num: number, decimals: number) => Math.round(num * 10 ** decimals) / 10 ** decimals;
export const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);
export const percentage = (value: number, total: number) => total === 0 ? 0 : (value / total) * 100;
