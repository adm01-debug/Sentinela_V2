import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationBell } from '../NotificationBell';
describe('NotificationBell', () => {
  it('renders bell', () => { render(<NotificationBell count={0} onClick={vi.fn()} />); expect(screen.getByRole('button')).toBeInTheDocument(); });
  it('shows count', () => { render(<NotificationBell count={5} onClick={vi.fn()} />); expect(screen.getByText('5')).toBeInTheDocument(); });
  it('hides count when zero', () => { render(<NotificationBell count={0} onClick={vi.fn()} />); expect(screen.queryByText('0')).not.toBeInTheDocument(); });
  it('handles click', () => { const onClick = vi.fn(); render(<NotificationBell count={3} onClick={onClick} />); fireEvent.click(screen.getByRole('button')); expect(onClick).toHaveBeenCalled(); });
});