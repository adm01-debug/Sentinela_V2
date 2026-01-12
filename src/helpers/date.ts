import { format, formatDistance, isValid, parseISO } from "date-fns";
import { DATE_FORMATS } from "@/constants";

export function formatDate(date: string | Date, formatStr = DATE_FORMATS.DISPLAY_DATE): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "Invalid date";
  return format(d, formatStr);
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, DATE_FORMATS.DISPLAY_DATETIME);
}

export function formatTime(date: string | Date): string {
  return formatDate(date, DATE_FORMATS.DISPLAY_TIME);
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "Invalid date";
  return formatDistance(d, new Date(), { addSuffix: true });
}

export function isValidDate(date: string): boolean {
  return isValid(parseISO(date));
}

export function getDateRange(days: number): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { start, end };
}
