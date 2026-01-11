import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationItem } from '../NotificationItem';
describe('NotificationItem', () => {
  const notif = { id: '1', title: 'Alert', message: 'New violation', time: '5m ago', read: false };
  it('renders notification', () => { render(<NotificationItem notification={notif} />); expect(screen.getByText('Alert')).toBeInTheDocument(); });
  it('shows unread indicator', () => { render(<NotificationItem notification={notif} />); expect(screen.getByTestId('unread-dot')).toBeInTheDocument(); });
  it('handles click', () => { const onClick = vi.fn(); render(<NotificationItem notification={notif} onClick={onClick} />); fireEvent.click(screen.getByText('Alert')); expect(onClick).toHaveBeenCalled(); });
  it('handles dismiss', () => { const onDismiss = vi.fn(); render(<NotificationItem notification={notif} onDismiss={onDismiss} />); fireEvent.click(screen.getByRole('button', { name: /dismiss/i })); expect(onDismiss).toHaveBeenCalled(); });
});