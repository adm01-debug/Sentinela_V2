import { describe, it, expect, beforeEach } from 'vitest';
import { useNotificationStore } from '../notificationStore';
describe('notificationStore', () => {
  beforeEach(() => { useNotificationStore.setState({ notifications: [], unreadCount: 0 }); });
  it('adds notification', () => { useNotificationStore.getState().addNotification({ title: 'Test', message: 'Msg', type: 'info' }); expect(useNotificationStore.getState().notifications).toHaveLength(1); });
  it('marks as read', () => { useNotificationStore.getState().addNotification({ title: 'Test', message: 'Msg', type: 'info' }); const id = useNotificationStore.getState().notifications[0].id; useNotificationStore.getState().markAsRead(id); expect(useNotificationStore.getState().notifications[0].read).toBe(true); });
});