import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const fetch = useCallback(async () => {
    const data = await apiClient.get('/notifications');
    setNotifications(data);
    setUnreadCount(data.filter(n => !n.read).length);
  }, []);
  const markAsRead = async (id) => {
    await apiClient.post('/notifications/' + id + '/read');
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  const markAllAsRead = async () => {
    await apiClient.post('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };
  useEffect(() => { fetch(); }, [fetch]);
  return { notifications, unreadCount, markAsRead, markAllAsRead };
};