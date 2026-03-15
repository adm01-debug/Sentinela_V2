import { useState, useEffect } from 'react';

interface NetworkConnection extends EventTarget {
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
  saveData?: boolean;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkConnection;
}

interface NetworkState {
  online: boolean;
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
  saveData?: boolean;
}

export function useNetwork() {
  const [state, setState] = useState<NetworkState>({ online: navigator.onLine });
  
  useEffect(() => {
    const nav = navigator as NavigatorWithConnection;
    const update = () => {
      const conn = nav.connection;
      setState({ online: navigator.onLine, downlink: conn?.downlink, effectiveType: conn?.effectiveType, rtt: conn?.rtt, saveData: conn?.saveData });
    };
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    nav.connection?.addEventListener('change', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);
  
  return state;
}
export default useNetwork;
