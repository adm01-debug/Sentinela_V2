import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotificationBell } from '../NotificationBell';

vi.mock('@/stores/notificationStore', () => ({
  useNotificationStore: () => ({
    notifications: [{ id: '1', title: 'Test', message: 'Msg', read: false }],
    unreadCount: 1,
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  }),
}));

describe('NotificationBell', () => {
  it('should render bell icon', () => {
    render(<NotificationBell />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should show unread count', () => {
    render(<NotificationBell />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
