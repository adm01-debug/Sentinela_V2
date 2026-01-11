import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileDropdown } from '../ProfileDropdown';
describe('ProfileDropdown', () => {
  const user = { name: 'John Doe', email: 'john@test.com', avatar: '/avatar.jpg' };
  it('renders user info', () => { render(<ProfileDropdown user={user} onLogout={vi.fn()} />); fireEvent.click(screen.getByTestId('profile-trigger')); expect(screen.getByText('John Doe')).toBeInTheDocument(); });
  it('shows menu items', () => { render(<ProfileDropdown user={user} onLogout={vi.fn()} />); fireEvent.click(screen.getByTestId('profile-trigger')); expect(screen.getByText(/settings/i)).toBeInTheDocument(); });
  it('handles logout', () => { const onLogout = vi.fn(); render(<ProfileDropdown user={user} onLogout={onLogout} />); fireEvent.click(screen.getByTestId('profile-trigger')); fireEvent.click(screen.getByText(/logout/i)); expect(onLogout).toHaveBeenCalled(); });
});