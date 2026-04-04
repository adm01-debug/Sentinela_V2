import { memo } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { cn } from '@/lib/utils';

/**
 * Banner that appears when the user goes offline and shows a
 * reconnection confirmation when they come back online.
 */
export const NetworkStatusBanner = memo(function NetworkStatusBanner() {
  const { isOnline, wasOffline } = useNetworkStatus();

  if (isOnline && !wasOffline) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-300',
        !isOnline
          ? 'bg-destructive text-destructive-foreground'
          : 'bg-primary text-primary-foreground'
      )}
    >
      {!isOnline ? (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Sem conexão com a internet. Algumas funcionalidades podem não funcionar.</span>
        </>
      ) : (
        <>
          <Wifi className="h-4 w-4" />
          <span>Conexão restabelecida!</span>
        </>
      )}
    </div>
  );
});
