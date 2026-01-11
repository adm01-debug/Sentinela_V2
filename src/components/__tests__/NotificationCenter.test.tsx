import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationCenter } from '../NotificationCenter';
describe('NotificationCenter', () => {
  const notifs = [{ id: '1', title: 'New alert', time: '5m ago', read: false }];
  it('renders notifications', () => { render(<NotificationCenter notifications={notifs} />); expect(screen.getByText('New alert')).toBeInTheDocument(); });
  it('marks as read', () => { const onMarkRead = vi.fn(); render(<NotificationCenter notifications={notifs} onMarkRead={onMarkRead} />); fireEvent.click(screen.getByRole('button', { name: /mark read/i })); expect(onMarkRead).toHaveBeenCalled(); });
  it('marks all as read', () => { const onMarkAllRead = vi.fn(); render(<NotificationCenter notifications={notifs} onMarkAllRead={onMarkAllRead} />); fireEvent.click(screen.getByText(/mark all/i)); expect(onMarkAllRead).toHaveBeenCalled(); });
  it('shows empty state', () => { render(<NotificationCenter notifications={[]} />); expect(screen.getByText(/no notifications/i)).toBeInTheDocument(); });
});