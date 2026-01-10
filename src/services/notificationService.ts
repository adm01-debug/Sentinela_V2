import { supabase } from '@/integrations/supabase/client';

export type NotificationType = 'info' | 'warning' | 'error' | 'success';
export type NotificationChannel = 'in-app' | 'email' | 'push' | 'sms' | 'slack' | 'whatsapp';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  metadata?: Record<string, unknown>;
  expires_at?: string;
  organization_id: string;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  slack_enabled: boolean;
  whatsapp_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  categories: Record<string, boolean>;
}

export interface NotificationCreateData {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  channel?: NotificationChannel;
  priority?: NotificationPriority;
  action_url?: string;
  metadata?: Record<string, unknown>;
  expires_at?: string;
  organization_id: string;
}

export const notificationService = {
  /**
   * Get all notifications for a user
   */
  async getAll(userId: string, options: { unreadOnly?: boolean; limit?: number } = {}): Promise<Notification[]> {
    const { unreadOnly = false, limit = 50 } = options;
    
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as Notification[]) || [];
  },

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  },

  /**
   * Create a notification
   */
  async create(notification: NotificationCreateData): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        ...notification,
        channel: notification.channel || 'in-app',
        priority: notification.priority || 'normal',
        is_read: false,
      }])
      .select()
      .single();

    if (error) throw error;
    return data as Notification;
  },

  /**
   * Create notifications for multiple users
   */
  async createBulk(notifications: NotificationCreateData[]): Promise<Notification[]> {
    const items = notifications.map(n => ({
      ...n,
      channel: n.channel || 'in-app',
      priority: n.priority || 'normal',
      is_read: false,
    }));

    const { data, error } = await supabase
      .from('notifications')
      .insert(items)
      .select();

    if (error) throw error;
    return (data as Notification[]) || [];
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  },

  /**
   * Delete a notification
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Delete all read notifications for a user
   */
  async deleteAllRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('is_read', true);

    if (error) throw error;
  },

  /**
   * Get notification preferences for a user
   */
  async getPreferences(userId: string): Promise<NotificationPreferences | null> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as NotificationPreferences;
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
      })
      .select()
      .single();

    if (error) throw error;
    return data as NotificationPreferences;
  },

  /**
   * Send email notification
   */
  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: { to, subject, body },
      });
      return !error;
    } catch {
      console.error('Failed to send email notification');
      return false;
    }
  },

  /**
   * Send push notification
   */
  async sendPush(userId: string, title: string, body: string, data?: Record<string, unknown>): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('send-push', {
        body: { userId, title, body, data },
      });
      return !error;
    } catch {
      console.error('Failed to send push notification');
      return false;
    }
  },

  /**
   * Subscribe to real-time notifications
   */
  subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void
  ): { unsubscribe: () => void } {
    const subscription = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        subscription.unsubscribe();
      },
    };
  },

  /**
   * Check if user is in quiet hours
   */
  isInQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quiet_hours_start || !preferences.quiet_hours_end) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = preferences.quiet_hours_start.split(':').map(Number);
    const [endHour, endMin] = preferences.quiet_hours_end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  },
};

export default notificationService;
