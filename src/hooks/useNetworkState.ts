import { useState, useEffect } from 'react';

interface NetworkState {
  online: boolean;
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
}

export function useNetworkState(): NetworkState {
  const [state, setState] = useState<NetworkState>({ online: navigator.onLine });

  useEffect(() => {
    const updateState = () => {
      const conn = (navigator as any).connection;
      setState({
        online: navigator.onLine,
        downlink: conn?.downlink,
        effectiveType: conn?.effectiveType,
        rtt: conn?.rtt,
      });
    };

    window.addEventListener('online', updateState);
    window.addEventListener('offline', updateState);
    updateState();

    return () => {
      window.removeEventListener('online', updateState);
      window.removeEventListener('offline', updateState);
    };
  }, []);

  return state;
}
