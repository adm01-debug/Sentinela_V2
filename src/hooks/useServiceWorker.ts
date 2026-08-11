import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';

export interface UseServiceWorkerReturn {
  isSupported: boolean;
  isRegistered: boolean;
  isUpdateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
  register: () => Promise<void>;
  unregister: () => Promise<void>;
  update: () => Promise<void>;
  skipWaiting: () => void;
}

export function useServiceWorker(swUrl = '/sw.js'): UseServiceWorkerReturn {
  const [isSupported] = useState(() => 'serviceWorker' in navigator);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!isSupported) return;
    navigator.serviceWorker.getRegistration().then(reg => {
      if (reg) { setRegistration(reg); setIsRegistered(true); }
    });
  }, [isSupported]);

  const register = useCallback(async () => {
    if (!isSupported) return;
    try {
      const reg = await navigator.serviceWorker.register(swUrl);
      setRegistration(reg);
      setIsRegistered(true);
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) setIsUpdateAvailable(true);
        });
      });
    } catch (e) { logger.error('SW registration failed:', e); }
  }, [isSupported, swUrl]);

  const unregister = useCallback(async () => {
    if (registration) { await registration.unregister(); setIsRegistered(false); setRegistration(null); }
  }, [registration]);

  const update = useCallback(async () => { if (registration) await registration.update(); }, [registration]);

  const skipWaiting = useCallback(() => { registration?.waiting?.postMessage({ type: 'SKIP_WAITING' }); }, [registration]);

  return { isSupported, isRegistered, isUpdateAvailable, registration, register, unregister, update, skipWaiting };
}

export default useServiceWorker;
