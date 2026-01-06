import { useState, useCallback, useEffect } from 'react';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export interface UseNotificationCenterOptions {
  maxNotifications?: number;
  persistKey?: string;
}

export function useNotificationCenter(options: UseNotificationCenterOptions = {}) {
  const { maxNotifications = 50, persistKey = 'notifications' } = options;
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(persistKey);
    return stored ? JSON.parse(stored).map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) })) : [];
  });

  useEffect(() => {
    localStorage.setItem(persistKey, JSON.stringify(notifications));
  }, [notifications, persistKey]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = { ...notification, id: crypto.randomUUID(), timestamp: new Date(), read: false };
    setNotifications(prev => [newNotification, ...prev].slice(0, maxNotifications));
    return newNotification.id;
  }, [maxNotifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, addNotification, markAsRead, markAllAsRead, removeNotification, clearAll };
}

export default useNotificationCenter;
