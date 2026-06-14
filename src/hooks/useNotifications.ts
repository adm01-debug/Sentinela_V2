import { useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notificationService';

interface SecurityViolationRow {
  id: string;
  violation_type: string | null;
  severity: string | null;
  created_at: string;
  employee_name: string | null;
  description: string | null;
}

export interface HeaderNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  read: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins} min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
}

/**
 * Realtime notifications from security_violations for the header bell.
 */
export function useHeaderNotifications(limit = 8) {
  const queryClient = useQueryClient();
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const { data: raw = [], isLoading } = useQuery<HeaderNotification[]>({
    queryKey: ['header-notifications', limit],
    queryFn: async () => {
      const data = await notificationService.getHeaderNotifications(limit);
      return (data as SecurityViolationRow[]).map((v) => ({
        id: v.id,
        title: v.violation_type || 'Violação detectada',
        description: v.employee_name
          ? `${v.employee_name} — ${v.description || v.violation_type || ''}`
          : v.description || 'Detalhes indisponíveis',
        time: timeAgo(v.created_at),
        severity: (v.severity as HeaderNotification['severity']) || 'medium',
        read: false,
      }));
    },
    refetchInterval: 30000,
  });

  // Realtime: invalidate on INSERT
  useEffect(() => {
    return notificationService.subscribeToViolations(() => {
      queryClient.invalidateQueries({ queryKey: ['header-notifications'] });
    });
  }, [queryClient]);

  const notifications = raw.map((n) => ({ ...n, read: readIds.has(n.id) }));
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(() => {
    setReadIds(new Set(raw.map((n) => n.id)));
  }, [raw]);

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => new Set(prev).add(id));
  }, []);

  return { notifications, unreadCount, isLoading, markAllRead, markRead };
}

// Legacy hook kept for backward compat
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
    if (typeof globalThis.Notification !== 'undefined') {
      setPermission(globalThis.Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof globalThis.Notification === 'undefined') return 'denied' as NotificationPermission;
    const perm = await globalThis.Notification.requestPermission();
    setPermission(perm);
    return perm;
  }, []);

  const add = useCallback((title: string, message: string, type: Notification["type"] = "info") => {
    const notification: Notification = {
      id: crypto.randomUUID(), title, message, type, read: false, createdAt: new Date()
    };
    setNotifications(prev => [notification, ...prev]);
    
    if (permission === "granted" && typeof globalThis.Notification !== 'undefined') {
      new globalThis.Notification(title, { body: message });
    }
    return notification;
  }, [permission]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, permission, requestPermission, add, markAsRead };
}
