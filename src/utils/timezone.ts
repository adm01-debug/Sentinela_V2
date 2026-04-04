// Timezone utilities for Sentinela v17

export interface TimezoneInfo {
  id: string;
  name: string;
  offset: number;
  abbreviation: string;
}

export function getLocalTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getTimezoneOffset(timezone?: string): number {
  const date = new Date();
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone || getLocalTimezone() }));
  return (tzDate.getTime() - utcDate.getTime()) / (60 * 1000);
}

export function formatTimezoneOffset(offsetMinutes: any): string {
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const hours = Math.floor(Math.abs(offsetMinutes) / 60);
  const minutes = Math.abs(offsetMinutes) % 60;
  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function convertToTimezone(date: Date, targetTimezone: string): Date {
  return new Date(date.toLocaleString('en-US', { timeZone: targetTimezone }));
}

export function formatInTimezone(
  date: Date,
  timezone: string,
  options?: Intl.DateTimeFormatOptions
): string {
  return date.toLocaleString('pt-BR', { ...options, timeZone: timezone });
}

export function getTimezoneAbbreviation(timezone: string, date?: Date): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'short',
  });
  const parts = formatter.formatToParts(date || new Date());
  return parts.find((p) => p.type === 'timeZoneName')?.value || '';
}

export function isDST(date: Date, timezone?: string): boolean {
  const tz = timezone || getLocalTimezone();
  const jan = new Date(date.getFullYear(), 0, 1);
  const jul = new Date(date.getFullYear(), 6, 1);
  const janOffset = getTimezoneOffset(tz);
  const julOffset = getTimezoneOffset(tz);
  const currentOffset = getTimezoneOffset(tz);
  return currentOffset !== Math.max(janOffset, julOffset);
}

export const BRAZIL_TIMEZONES: TimezoneInfo[] = [
  { id: 'America/Sao_Paulo', name: 'Brasília', offset: -180, abbreviation: 'BRT' },
  { id: 'America/Manaus', name: 'Manaus', offset: -240, abbreviation: 'AMT' },
  { id: 'America/Rio_Branco', name: 'Rio Branco', offset: -300, abbreviation: 'ACT' },
  { id: 'America/Noronha', name: 'Fernando de Noronha', offset: -120, abbreviation: 'FNT' },
];

export const COMMON_TIMEZONES: TimezoneInfo[] = [
  { id: 'America/New_York', name: 'New York', offset: -300, abbreviation: 'EST' },
  { id: 'America/Los_Angeles', name: 'Los Angeles', offset: -480, abbreviation: 'PST' },
  { id: 'America/Chicago', name: 'Chicago', offset: -360, abbreviation: 'CST' },
  { id: 'Europe/London', name: 'London', offset: 0, abbreviation: 'GMT' },
  { id: 'Europe/Paris', name: 'Paris', offset: 60, abbreviation: 'CET' },
  { id: 'Europe/Berlin', name: 'Berlin', offset: 60, abbreviation: 'CET' },
  { id: 'Asia/Tokyo', name: 'Tokyo', offset: 540, abbreviation: 'JST' },
  { id: 'Asia/Shanghai', name: 'Shanghai', offset: 480, abbreviation: 'CST' },
  { id: 'Asia/Dubai', name: 'Dubai', offset: 240, abbreviation: 'GST' },
  { id: 'Australia/Sydney', name: 'Sydney', offset: 660, abbreviation: 'AEDT' },
];

export function getAllTimezones(): string[] {
  return Intl.supportedValuesOf('timeZone');
}

export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

export function getTimeDifference(timezone1: string, timezone2: string): number {
  return getTimezoneOffset(timezone1) - getTimezoneOffset(timezone2);
}
