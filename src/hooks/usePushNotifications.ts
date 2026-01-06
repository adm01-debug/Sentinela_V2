import { useState, useEffect, useCallback } from 'react';

export interface UsePushNotificationsOptions {
  vapidPublicKey?: string;
  onPermissionChange?: (permission: NotificationPermission) => void;
  onSubscriptionChange?: (subscription: PushSubscription | null) => void;
}

export function usePushNotifications(options: UsePushNotificationsOptions = {}) {
  const { vapidPublicKey, onPermissionChange, onSubscriptionChange } = options;
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    if (supported) setPermission(Notification.permission);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return 'denied' as NotificationPermission;
    const result = await Notification.requestPermission();
    setPermission(result);
    onPermissionChange?.(result);
    return result;
  }, [isSupported, onPermissionChange]);

  const subscribe = useCallback(async () => {
    if (!isSupported || permission !== 'granted') return null;
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      });
      setSubscription(sub);
      onSubscriptionChange?.(sub);
      return sub;
    } catch (e) {
      console.error('Push subscription failed:', e);
      return null;
    }
  }, [isSupported, permission, vapidPublicKey, onSubscriptionChange]);

  const unsubscribe = useCallback(async () => {
    if (subscription) {
      await subscription.unsubscribe();
      setSubscription(null);
      onSubscriptionChange?.(null);
    }
  }, [subscription, onSubscriptionChange]);

  const showNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (permission !== 'granted') return null;
    const registration = await navigator.serviceWorker.ready;
    return registration.showNotification(title, options);
  }, [permission]);

  return { isSupported, permission, subscription, requestPermission, subscribe, unsubscribe, showNotification, isSubscribed: !!subscription };
}

export default usePushNotifications;
