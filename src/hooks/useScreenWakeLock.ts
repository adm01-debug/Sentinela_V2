import { useState, useCallback, useEffect } from 'react';
export function useScreenWakeLock() {
  const [isSupported] = useState(() => 'wakeLock' in navigator);
  const [isActive, setIsActive] = useState(false);
  const [wakeLock, setWakeLock] = useState<any>(null);
  const request = useCallback(async () => {
    if (!isSupported) return false;
    try { const lock = await (navigator as any).wakeLock.request('screen'); setWakeLock(lock); setIsActive(true); lock.addEventListener('release', () => setIsActive(false)); return true;
    } catch { return false; }
  }, [isSupported]);
  const release = useCallback(async () => { if (wakeLock) { await wakeLock.release(); setWakeLock(null); setIsActive(false); } }, [wakeLock]);
  useEffect(() => { return () => { wakeLock?.release(); }; }, [wakeLock]);
  return { isSupported, isActive, request, release };
}
export default useScreenWakeLock;
