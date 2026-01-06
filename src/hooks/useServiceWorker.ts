import { useState, useEffect, useCallback } from "react";

interface UseServiceWorkerReturn {
  isSupported: boolean;
  isRegistered: boolean;
  isUpdateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
  register: () => Promise<ServiceWorkerRegistration | null>;
  unregister: () => Promise<boolean>;
  update: () => Promise<void>;
  skipWaiting: () => void;
}

export function useServiceWorker(swUrl = "/sw.js"): UseServiceWorkerReturn {
  const [isSupported] = useState(() => typeof navigator !== "undefined" && "serviceWorker" in navigator);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const register = useCallback(async () => {
    if (!isSupported) return null;
    try {
      const reg = await navigator.serviceWorker.register(swUrl);
      setRegistration(reg);
      setIsRegistered(true);
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        newWorker?.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setIsUpdateAvailable(true);
          }
        });
      });
      return reg;
    } catch { return null; }
  }, [isSupported, swUrl]);

  const unregister = useCallback(async () => {
    if (registration) {
      const success = await registration.unregister();
      if (success) { setIsRegistered(false); setRegistration(null); }
      return success;
    }
    return false;
  }, [registration]);

  const update = useCallback(async () => { if (registration) await registration.update(); }, [registration]);
  const skipWaiting = useCallback(() => { registration?.waiting?.postMessage({ type: "SKIP_WAITING" }); }, [registration]);

  useEffect(() => {
    if (isSupported) {
      navigator.serviceWorker.getRegistration().then((reg) => { if (reg) { setRegistration(reg); setIsRegistered(true); } });
    }
  }, [isSupported]);

  return { isSupported, isRegistered, isUpdateAvailable, registration, register, unregister, update, skipWaiting };
}

export default useServiceWorker;
