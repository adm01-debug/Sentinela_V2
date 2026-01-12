import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/utils/cn';

interface OnlineStatusProps { showLabel?: boolean; className?: string; }

export function OnlineStatus({ showLabel = true, className }: OnlineStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {isOnline ? (
        <><Wifi className="h-4 w-4 text-green-500" />{showLabel && <span className="text-sm text-green-600">Online</span>}</>
      ) : (
        <><WifiOff className="h-4 w-4 text-red-500" />{showLabel && <span className="text-sm text-red-600">Offline</span>}</>
      )}
    </div>
  );
}
