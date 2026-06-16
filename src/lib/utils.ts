/**
 * Barrel export for all utility functions.
 * Individual modules can be imported directly for tree-shaking:
 *   import { formatDate } from '@/lib/utils/date';
 * Or use the barrel export for convenience:
 *   import { cn, formatDate, capitalize } from '@/lib/utils';
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Core class utility (most commonly used)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export all utilities from sub-modules
export { formatDate, formatDateTime, formatRelativeTime } from "./utils/date";
export {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatBytes,
  formatDuration,
  clamp,
  round,
} from "./utils/number";
export {
  capitalize,
  capitalizeWords,
  truncate,
  slugify,
  getInitials,
  maskString,
} from "./utils/string";
export { generateId, generateUUID, sleep, retry, debounce, throttle, memoize } from "./utils/async";
export {
  groupBy,
  uniqueBy,
  sortBy,
  chunk,
  omit,
  pick,
  deepClone,
  isEmpty,
} from "./utils/collections";
export { isValidEmail, isValidUrl, isValidUUID } from "./utils/validation";
export { copyToClipboard, downloadFile, getQueryParams } from "./utils/browser";
