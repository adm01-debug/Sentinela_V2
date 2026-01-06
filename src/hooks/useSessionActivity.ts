import { useState, useEffect, useCallback } from 'react';

export interface SessionActivity {
  id: string;
  type: 'login' | 'logout' | 'action' | 'error' | 'warning';
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface UseSessionActivityOptions {
  maxItems?: number;
  storageKey?: string;
  onNewActivity?: (activity: SessionActivity) => void;
}

export function useSessionActivity(options: UseSessionActivityOptions = {}) {
  const { maxItems = 100, storageKey = 'session-activity', onNewActivity } = options;
  const [activities, setActivities] = useState<SessionActivity[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) setActivities(JSON.parse(stored).map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) })));
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(activities));
  }, [activities, storageKey]);

  const logActivity = useCallback((type: SessionActivity['type'], description: string, metadata?: Record<string, any>) => {
    const activity: SessionActivity = {
      id: crypto.randomUUID(),
      type,
      description,
      timestamp: new Date(),
      metadata,
      userAgent: navigator.userAgent,
    };
    setActivities(prev => [activity, ...prev].slice(0, maxItems));
    onNewActivity?.(activity);
    return activity;
  }, [maxItems, onNewActivity]);

  const clearActivities = useCallback(() => {
    setActivities([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const getActivitiesByType = useCallback((type: SessionActivity['type']) => activities.filter(a => a.type === type), [activities]);

  return { activities, logActivity, clearActivities, getActivitiesByType, recentActivity: activities[0] || null };
}

export default useSessionActivity;
