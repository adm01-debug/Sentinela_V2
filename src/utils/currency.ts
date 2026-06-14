// Currency utilities for Sentinela v17

export interface CurrencyOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  notation?: 'standard' | 'compact';
}

export function formatCurrency(
  amount: number,
  options: CurrencyOptions = {}
): string {
  const {
    currency = 'BRL',
    locale = 'pt-BR',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    notation = 'standard',
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
    notation,
  }).format(amount);
}

export function parseCurrency(value: string, locale: string = 'pt-BR'): number {
  const decimalSeparator = locale.startsWith('pt') ? ',' : '.';

  const cleaned = value
    .replace(/[^\d,.-]/g, '')
    .replace(new RegExp(`\${thousandsSeparator}`, 'g'), '')
    .replace(decimalSeparator, '.');

  return parseFloat(cleaned) || 0;
}

export function formatCompactCurrency(amount: number, currency: string = 'BRL'): string {
  return formatCurrency(amount, { currency, notation: 'compact' });
}

export function convertCurrency(
  amount: number,
  fromRate: number,
  toRate: number
): number {
  return (amount / fromRate) * toRate;
}

export function roundCurrency(amount: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(amount * factor) / factor;
}

export function getCurrencySymbol(currency: string, locale: string = 'pt-BR'): string {
  const formatted = formatCurrency(0, { currency, locale });
  return formatted.replace(/[\d\s.,]/g, '').trim();
}

export const CURRENCY_CODES = {
  BRL: { symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
  USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
  JPY: { symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  ARS: { symbol: '$', name: 'Argentine Peso', locale: 'es-AR' },
  CLP: { symbol: '$', name: 'Chilean Peso', locale: 'es-CL' },
  MXN: { symbol: '$', name: 'Mexican Peso', locale: 'es-MX' },
  COP: { symbol: '$', name: 'Colombian Peso', locale: 'es-CO' },
} as const;

export type CurrencyCode = keyof typeof CURRENCY_CODES;

export function formatPercentage(
  value: number,
  options?: { decimals?: number; locale?: string }
): string {
  const { decimals = 2, locale = 'pt-BR' } = options || {};
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue === 0 ? 0 : 100;
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
}
