/**
 * Utility functions for formatting data
 */

import { format, formatDistance, formatRelative, parseISO, isValid } from 'date-fns';
import type { Locale } from 'date-fns';
import { ptBR, es, enUS } from 'date-fns/locale';

const locales: Record<string, Locale> = {
  'pt-BR': ptBR,
  'es': es,
  'en': enUS,
};

const getLocale = () => locales[localStorage.getItem('i18nextLng') || 'en'] || enUS;

// Date Formatters
export const formatDate = (date: string | Date, formatStr = 'PP'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? format(d, formatStr, { locale: getLocale() }) : '';
};

export const formatDateTime = (date: string | Date): string => formatDate(date, 'PPpp');
export const formatTime = (date: string | Date): string => formatDate(date, 'p');
export const formatRelativeDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? formatRelative(d, new Date(), { locale: getLocale() }) : '';
};

export const formatTimeAgo = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? formatDistance(d, new Date(), { addSuffix: true, locale: getLocale() }) : '';
};

// Number Formatters
export const formatNumber = (num: number, options?: Intl.NumberFormatOptions): string => 
  new Intl.NumberFormat(localStorage.getItem('i18nextLng') || 'en', options).format(num);

export const formatCurrency = (amount: number, currency = 'BRL'): string =>
  formatNumber(amount, { style: 'currency', currency });

export const formatPercent = (value: number, decimals = 1): string =>
  formatNumber(value / 100, { style: 'percent', minimumFractionDigits: decimals });

export const formatCompact = (num: number): string =>
  formatNumber(num, { notation: 'compact', maximumFractionDigits: 1 });

// String Formatters
export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const titleCase = (str: string): string =>
  str.split(' ').map(capitalize).join(' ');

export const truncate = (str: string, length: number, suffix = '...'): string =>
  str.length > length ? str.slice(0, length - suffix.length) + suffix : str;

export const slugify = (str: string): string =>
  str.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');

// File Size Formatter
export const formatFileSize = (bytes: unknown): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Phone Formatter (BR)
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '(\$1) \$2-\$3');
  if (cleaned.length === 10) return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '(\$1) \$2-\$3');
  return phone;
};

// CPF/CNPJ Formatter
export const formatCPF = (cpf: string): string =>
  cpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '\$1.\$2.\$3-\$4');

export const formatCNPJ = (cnpj: string): string =>
  cnpj.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '\$1.\$2.\$3/\$4-\$5');
