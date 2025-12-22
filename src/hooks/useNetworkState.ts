import { useState, useEffect } from 'react';

export function useNetworkState() {
  const [state, setState] = useState({ online: navigator.onLine, downlink: 0, effectiveType: '4g' });

  useEffect(() => {
    const update = () => {
      const conn = (navigator as any).connection;
      setState({ online: navigator.onLine, downlink: conn?.downlink || 0, effectiveType: conn?.effectiveType || '4g' });
    };
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);

  return state;
}