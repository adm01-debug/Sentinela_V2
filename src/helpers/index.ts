// Re-export cn utility for backwards compatibility
export { cn } from '@/lib/utils';

// Re-export common utilities - avoid duplicates by using explicit imports
export { formatDate, formatRelative, isValidDate, daysDiff } from '@/utils/date';
export { truncate, stripHtml, escapeHtml, camelToKebab, kebabToCamel, pluralize, initials, maskEmail } from '@/utils/string';
export { formatNumber, formatCurrency, formatPercent, formatBytes, roundTo, clamp, percentage } from '@/utils/number';
