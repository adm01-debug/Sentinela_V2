import { useState, useEffect, useCallback } from 'react';

// ============================================================
// TYPES
// ============================================================

interface NetworkStatus {
  isOnline: boolean;
  isOffline: boolean;
  downlink?: number;
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  rtt?: number;
  saveData?: boolean;
  type?: string;
}

interface NetworkConnection extends EventTarget {
  downlink?: number;
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  rtt?: number;
  saveData?: boolean;
  type?: string;
}

declare global {
  interface Navigator {
    connection?: NetworkConnection;
    mozConnection?: NetworkConnection;
    webkitConnection?: NetworkConnection;
  }
}

// ============================================================
// useNetworkStatus - Monitor network connectivity
// ============================================================

/**
 * Hook to monitor network connectivity status
 * Returns online/offline state and connection quality info
 */
export function useNetworkStatus(): NetworkStatus {
  const getConnection = (): NetworkConnection | undefined => {
    if (typeof navigator === 'undefined') return undefined;
    return navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  };

  const getNetworkStatus = useCallback((): NetworkStatus => {
    const connection = getConnection();
    
    return {
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
      downlink: connection?.downlink,
      effectiveType: connection?.effectiveType,
      rtt: connection?.rtt,
      saveData: connection?.saveData,
      type: connection?.type,
    };
  }, []);

  const [status, setStatus] = useState<NetworkStatus>(getNetworkStatus);

  useEffect(() => {
    const handleOnline = () => {
      setStatus((prev) => ({ ...prev, isOnline: true, isOffline: false }));
    };

    const handleOffline = () => {
      setStatus((prev) => ({ ...prev, isOnline: false, isOffline: true }));
    };

    const handleConnectionChange = () => {
      setStatus(getNetworkStatus());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection = getConnection();
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [getNetworkStatus]);

  return status;
}

// ============================================================
// useIsOnline - Simple online status
// ============================================================

/**
 * Simple hook that returns true if online
 */
export function useIsOnline(): boolean {
  const { isOnline } = useNetworkStatus();
  return isOnline;
}

// ============================================================
// useIsSlowConnection - Detect slow connections
// ============================================================

/**
 * Returns true if connection is slow (2g or slow-2g)
 */
export function useIsSlowConnection(): boolean {
  const { effectiveType } = useNetworkStatus();
  return effectiveType === 'slow-2g' || effectiveType === '2g';
}

// ============================================================
// useOnlineCallback - Execute callback when back online
// ============================================================

/**
 * Execute a callback when the user comes back online
 */
export function useOnlineCallback(callback: () => void): void {
  const { isOnline } = useNetworkStatus();
  const wasOffline = usePrevious(isOnline === false);

  useEffect(() => {
    if (isOnline && wasOffline) {
      callback();
    }
  }, [isOnline, wasOffline, callback]);
}

// Helper hook for previous value
function usePrevious<T>(value: T): T | undefined {
  const [prev, setPrev] = useState<T | undefined>(undefined);
  
  useEffect(() => {
    setPrev(value);
  }, [value]);
  
  return prev;
}

// ============================================================
// useOfflineDetector - Show toast when offline
// ============================================================

import { useToast } from '@/hooks/use-toast';

/**
 * Automatically shows a toast when going offline/online
 */
export function useOfflineDetector(): void {
  const { isOnline, isOffline } = useNetworkStatus();
  const { toast } = useToast();
  const wasOnline = usePrevious(isOnline);

  useEffect(() => {
    // Just went offline
    if (isOffline && wasOnline === true) {
      toast({
        title: 'Sem conexão',
        description: 'Você está offline. Algumas funcionalidades podem não estar disponíveis.',
        variant: 'destructive',
      });
    }

    // Just came back online
    if (isOnline && wasOnline === false) {
      toast({
        title: 'Conectado',
        description: 'Sua conexão foi restaurada.',
      });
    }
  }, [isOnline, isOffline, wasOnline, toast]);
}
