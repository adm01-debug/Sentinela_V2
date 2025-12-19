import { memo, useState, useEffect } from 'react';
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SimpleTooltip } from '@/components/CustomTooltip';

// ============================================================
// TYPES
// ============================================================

interface TimeAgoProps {
  date: Date | string | number;
  className?: string;
  showTooltip?: boolean;
  updateInterval?: number;
  prefix?: string;
  suffix?: string;
}

// ============================================================
// TimeAgo - Relative time display
// ============================================================

function TimeAgoComponent({
  date,
  className,
  showTooltip = true,
  updateInterval = 60000, // Update every minute
  prefix = '',
  suffix = '',
}: TimeAgoProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');

  const dateObj = date instanceof Date ? date : new Date(date);

  useEffect(() => {
    const updateTimeAgo = () => {
      setTimeAgo(
        formatDistanceToNow(dateObj, {
          addSuffix: true,
          locale: ptBR,
        })
      );
    };

    updateTimeAgo();

    const interval = setInterval(updateTimeAgo, updateInterval);
    return () => clearInterval(interval);
  }, [dateObj, updateInterval]);

  const fullDate = format(dateObj, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
    locale: ptBR,
  });

  const displayText = `${prefix}${timeAgo}${suffix}`;

  if (showTooltip) {
    return (
      <SimpleTooltip content={fullDate}>
        <time dateTime={dateObj.toISOString()} className={className}>
          {displayText}
        </time>
      </SimpleTooltip>
    );
  }

  return (
    <time dateTime={dateObj.toISOString()} className={className}>
      {displayText}
    </time>
  );
}

export const TimeAgo = memo(TimeAgoComponent);

// ============================================================
// SmartDate - Shows relative or absolute based on recency
// ============================================================

interface SmartDateProps {
  date: Date | string | number;
  className?: string;
  showTooltip?: boolean;
}

function SmartDateComponent({ date, className, showTooltip = true }: SmartDateProps) {
  const dateObj = date instanceof Date ? date : new Date(date);

  let displayText: string;

  if (isToday(dateObj)) {
    displayText = `Hoje às ${format(dateObj, 'HH:mm', { locale: ptBR })}`;
  } else if (isYesterday(dateObj)) {
    displayText = `Ontem às ${format(dateObj, 'HH:mm', { locale: ptBR })}`;
  } else if (isThisWeek(dateObj)) {
    displayText = format(dateObj, "EEEE 'às' HH:mm", { locale: ptBR });
  } else {
    displayText = format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  }

  const fullDate = format(dateObj, "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
    locale: ptBR,
  });

  if (showTooltip) {
    return (
      <SimpleTooltip content={fullDate}>
        <time dateTime={dateObj.toISOString()} className={className}>
          {displayText}
        </time>
      </SimpleTooltip>
    );
  }

  return (
    <time dateTime={dateObj.toISOString()} className={className}>
      {displayText}
    </time>
  );
}

export const SmartDate = memo(SmartDateComponent);

// ============================================================
// DateDisplay - Formatted date display
// ============================================================

interface DateDisplayProps {
  date: Date | string | number;
  format?: string;
  className?: string;
}

function DateDisplayComponent({
  date,
  format: formatStr = 'dd/MM/yyyy',
  className,
}: DateDisplayProps) {
  const dateObj = date instanceof Date ? date : new Date(date);

  return (
    <time dateTime={dateObj.toISOString()} className={className}>
      {format(dateObj, formatStr, { locale: ptBR })}
    </time>
  );
}

export const DateDisplay = memo(DateDisplayComponent);

// ============================================================
// DateTimeDisplay - Date and time display
// ============================================================

function DateTimeDisplayComponent({
  date,
  className,
}: Omit<DateDisplayProps, 'format'>) {
  return <DateDisplay date={date} format="dd/MM/yyyy 'às' HH:mm" className={className} />;
}

export const DateTimeDisplay = memo(DateTimeDisplayComponent);

// ============================================================
// Duration - Duration display
// ============================================================

interface DurationProps {
  seconds: number;
  className?: string;
  showZero?: boolean;
}

function DurationComponent({ seconds, className, showZero = false }: DurationProps) {
  if (seconds === 0 && !showZero) {
    return <span className={className}>-</span>;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  let parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes}m`);
  }
  if (secs > 0 && hours === 0) {
    parts.push(`${secs}s`);
  }

  return <span className={className}>{parts.join(' ')}</span>;
}

export const Duration = memo(DurationComponent);
