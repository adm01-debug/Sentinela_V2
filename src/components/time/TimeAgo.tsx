import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimeAgoProps {
  date: Date | string | number;
  updateInterval?: number;
  className?: string;
}

export function TimeAgo({ date, updateInterval = 60000, className }: TimeAgoProps) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const update = () => {
      setTimeAgo(formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR }));
    };
    update();
    const interval = setInterval(update, updateInterval);
    return () => clearInterval(interval);
  }, [date, updateInterval]);

  return <time dateTime={new Date(date).toISOString()} className={className}>{timeAgo}</time>;
}
