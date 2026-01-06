import { useState, useEffect } from 'react';
interface NetworkState { online: boolean; downlink?: number; effectiveType?: string; rtt?: number; saveData?: boolean; }
export function useNetwork() {
  const [state, setState] = useState<NetworkState>({ online: navigator.onLine });
  useEffect(() => {
    const update = () => {
      const conn = (navigator as any).connection;
      setState({ online: navigator.onLine, downlink: conn?.downlink, effectiveType: conn?.effectiveType, rtt: conn?.rtt, saveData: conn?.saveData });
    };
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    (navigator as any).connection?.addEventListener('change', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);
  return state;
}
export default useNetwork;
