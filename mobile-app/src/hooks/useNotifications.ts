import { useState, useEffect } from 'react';
import { registerForPushNotifications } from '@/services/notifications';

export function useNotifications() {
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
    registerForPushNotifications().then(setToken);
  }, []);
  
  return { token };
}
