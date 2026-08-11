// Duration utilities for Sentinela v17

export interface Duration {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

const MS = {
  second: 1000,
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
};

export function toMilliseconds(duration: Duration): number {
  return (
    (duration.years || 0) * MS.year +
    (duration.months || 0) * MS.month +
    (duration.weeks || 0) * MS.week +
    (duration.days || 0) * MS.day +
    (duration.hours || 0) * MS.hour +
    (duration.minutes || 0) * MS.minute +
    (duration.seconds || 0) * MS.second +
    (duration.milliseconds || 0)
  );
}

export function fromMilliseconds(ms): Duration {
  const absMs = Math.abs(ms);
  return {
    days: Math.floor(absMs / MS.day),
    hours: Math.floor((absMs % MS.day) / MS.hour),
    minutes: Math.floor((absMs % MS.hour) / MS.minute),
    seconds: Math.floor((absMs % MS.minute) / MS.second),
    milliseconds: absMs % MS.second,
  };
}

export function formatDuration(ms: number, options?: { short?: boolean; maxUnits?: number }): string {
  const { short = false, maxUnits = 2 } = options || {};
  const duration = fromMilliseconds(ms);
  const parts: string[] = [];

  const units: { key: keyof Duration; long: string; short: string }[] = [
    { key: 'days', long: 'dia', short: 'd' },
    { key: 'hours', long: 'hora', short: 'h' },
    { key: 'minutes', long: 'minuto', short: 'min' },
    { key: 'seconds', long: 'segundo', short: 's' },
  ];

  for (const unit of units) {
    const value = duration[unit.key];
    if (value && value > 0) {
      if (short) {
        parts.push(`${value}${unit.short}`);
      } else {
        parts.push(`${value} ${unit.long}${value > 1 ? 's' : ''}`);
      }
      if (parts.length >= maxUnits) break;
    }
  }

  return parts.join(short ? ' ' : ' e ') || (short ? '0s' : '0 segundos');
}

export function formatTimeAgo(date: Date | string | number): string {
  const now = Date.now();
  const timestamp = new Date(date).getTime();
  const diff = now - timestamp;

  if (diff < MS.minute) return 'agora mesmo';
  if (diff < MS.hour) return `há ${Math.floor(diff / MS.minute)} min`;
  if (diff < MS.day) return `há ${Math.floor(diff / MS.hour)}h`;
  if (diff < MS.week) return `há ${Math.floor(diff / MS.day)} dias`;
  if (diff < MS.month) return `há ${Math.floor(diff / MS.week)} semanas`;
  if (diff < MS.year) return `há ${Math.floor(diff / MS.month)} meses`;
  return `há ${Math.floor(diff / MS.year)} anos`;
}

export function formatTimeRemaining(targetDate: Date | string | number): string {
  const now = Date.now();
  const target = new Date(targetDate).getTime();
  const diff = target - now;

  if (diff <= 0) return 'expirado';
  return `em ${formatDuration(diff)}`;
}

export function addDuration(date: Date, duration: Duration): Date {
  return new Date(date.getTime() + toMilliseconds(duration));
}

export function subtractDuration(date: Date, duration: Duration): Date {
  return new Date(date.getTime() - toMilliseconds(duration));
}

export function humanReadableDuration(seconds): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

export function parseIsoDuration(iso): Duration {
  const match = iso.match(/P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/);
  if (!match) return {};
  return {
    years: parseInt(match[1]) || 0,
    months: parseInt(match[2]) || 0,
    weeks: parseInt(match[3]) || 0,
    days: parseInt(match[4]) || 0,
    hours: parseInt(match[5]) || 0,
    minutes: parseInt(match[6]) || 0,
    seconds: parseInt(match[7]) || 0,
  };
}
