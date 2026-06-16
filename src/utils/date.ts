import {
  format,
  formatDistanceToNow,
  parseISO,
  isValid,
  differenceInDays,
  addDays,
  subDays,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
export const formatDate = (date: string | Date, fmt = "PPP") =>
  format(typeof date === "string" ? parseISO(date) : date, fmt);
export const formatRelative = (date: string | Date) =>
  formatDistanceToNow(typeof date === "string" ? parseISO(date) : date, { addSuffix: true });
export const isValidDate = (date) =>
  date instanceof Date ? isValid(date) : typeof date === "string" && isValid(parseISO(date));
export const daysDiff = (start: Date, end: Date) => differenceInDays(end, start);
export { addDays, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth };
