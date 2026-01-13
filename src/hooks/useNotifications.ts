import { useState, useCallback, useEffect } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: Date;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    setPermission(Notification.permission);
  }, []);

  const requestPermission = useCallback(async () => {
    const perm = await Notification.requestPermission();
    setPermission(perm);
    return perm;
  }, []);

  const add = useCallback((title: string, message: string, type: Notification["type"] = "info") => {
    const notification: Notification = {
      id: crypto.randomUUID(), title, message, type, read: false, createdAt: new Date()
    };
    setNotifications(prev => [notification, ...prev]);
    
    if (permission === "granted") {
      new Notification(title, { body: message });
    }
    return notification;
  }, [permission]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, permission, requestPermission, add, markAsRead };
}
