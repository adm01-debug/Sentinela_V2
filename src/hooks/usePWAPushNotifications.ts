import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
  actions?: { action: string; title: string; icon?: string }[];
}

export function usePWAPushNotifications() {
  const [isSupported] = useState(() => 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
      navigator.serviceWorker.ready.then(reg => reg.pushManager.getSubscription().then(setSubscription));
    }
  }, [isSupported]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return 'denied';
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!isSupported || permission !== 'granted') return null;
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
      });
      setSubscription(sub);
      // Save to backend
      await supabase.from('push_subscriptions').upsert({ endpoint: sub.endpoint, subscription: JSON.stringify(sub), user_agent: navigator.userAgent });
      return sub;
    } catch (e) { console.error('Subscribe error:', e); return null; }
    finally { setIsLoading(false); }
  }, [isSupported, permission]);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return false;
    try {
      await subscription.unsubscribe();
      await supabase.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint);
      setSubscription(null);
      return true;
    } catch { return false; }
  }, [subscription]);

  const showLocalNotification = useCallback((payload: PushNotificationPayload) => {
    if (permission !== 'granted') return;
    new Notification(payload.title, { body: payload.body, icon: payload.icon || '/icons/icon-192x192.png', badge: payload.badge, data: payload.data });
  }, [permission]);

  return { isSupported, permission, subscription, isLoading, requestPermission, subscribe, unsubscribe, showLocalNotification, isSubscribed: !!subscription };
}

export default usePWAPushNotifications;
