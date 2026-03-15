import { useState, useCallback, useEffect } from 'react';

interface WakeLockSentinel extends EventTarget {
  release(): Promise<void>;
  addEventListener(type: 'release', listener: () => void): void;
}

interface NavigatorWithWakeLock extends Navigator {
  wakeLock?: { request(type: 'screen'): Promise<WakeLockSentinel> };
}

export function useScreenWakeLock() {
  const [isSupported] = useState(() => 'wakeLock' in navigator);
  const [isActive, setIsActive] = useState(false);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  
  const request = useCallback(async () => {
    if (!isSupported) return false;
    try {
      const nav = navigator as NavigatorWithWakeLock;
      const lock = await nav.wakeLock!.request('screen');
      setWakeLock(lock);
      setIsActive(true);
      lock.addEventListener('release', () => setIsActive(false));
      return true;
    } catch { return false; }
  }, [isSupported]);
  
  const release = useCallback(async () => {
    if (wakeLock) { await wakeLock.release(); setWakeLock(null); setIsActive(false); }
  }, [wakeLock]);
  
  useEffect(() => { return () => { wakeLock?.release(); }; }, [wakeLock]);
  
  return { isSupported, isActive, request, release };
}
export default useScreenWakeLock;
