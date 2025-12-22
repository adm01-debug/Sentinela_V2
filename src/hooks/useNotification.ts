import { useState, useCallback, useEffect } from 'react';

export function useNotification() {
  const [permission, setPermission] = useState(Notification.permission);

  const request = useCallback(async () => {
    const p = await Notification.requestPermission();
    setPermission(p);
    return p;
  }, []);

  const notify = useCallback((title: string, options?: NotificationOptions) => {
    if (permission === 'granted') new Notification(title, options);
  }, [permission]);

  return { permission, request, notify, isSupported: 'Notification' in window };
}