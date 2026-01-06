import { useState, useEffect, useCallback } from 'react';

export interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  subscribe: () => Promise<PushSubscription | null>;
  unsubscribe: () => Promise<boolean>;
  showNotification: (title: string, options?: NotificationOptions) => void;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported] = useState(() => 'Notification' in window && 'serviceWorker' in navigator);
  const [permission, setPermission] = useState<NotificationPermission>(() => isSupported ? Notification.permission : 'denied');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!isSupported) return;
    navigator.serviceWorker.ready.then(async (reg) => {
      const subscription = await reg.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    }).catch(() => {});
  }, [isSupported]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return 'denied';
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!isSupported || permission !== 'granted') return null;
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY
      });
      setIsSubscribed(true);
      return subscription;
    } catch (e) { console.error('Push subscription failed:', e); return null; }
  }, [isSupported, permission]);

  const unsubscribe = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      if (subscription) { await subscription.unsubscribe(); setIsSubscribed(false); return true; }
      return false;
    } catch (e) { return false; }
  }, []);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission === 'granted') new Notification(title, options);
  }, [permission]);

  return { isSupported, permission, isSubscribed, requestPermission, subscribe, unsubscribe, showNotification };
}

export default usePushNotifications;
