import { useState, useCallback, useEffect } from 'react';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  read: boolean;
  timestamp: Date;
  action?: { label: string; onClick: () => void };
  persistent?: boolean;
}

export interface UseNotificationCenterOptions {
  maxNotifications?: number;
  storageKey?: string;
  onNewNotification?: (notification: Notification) => void;
}

export function useNotificationCenter(options: UseNotificationCenterOptions = {}) {
  const { maxNotifications = 50, storageKey = 'notifications', onNewNotification } = options;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setNotifications(JSON.parse(stored).map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) })));
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(notifications));
  }, [notifications, storageKey]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      read: false,
      timestamp: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, maxNotifications));
    onNewNotification?.(newNotification);
    return newNotification.id;
  }, [maxNotifications, onNewNotification]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications(prev => prev.filter(n => n.persistent));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications, unreadCount, isOpen, setIsOpen,
    addNotification, markAsRead, markAllAsRead, removeNotification, clearAll,
    hasUnread: unreadCount > 0
  };
}

export default useNotificationCenter;
