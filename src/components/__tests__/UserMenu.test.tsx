import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserMenu } from '../UserMenu';
describe('UserMenu', () => {
  const user = { name: 'John', email: 'john@test.com', avatar: '/avatar.jpg' };
  it('renders', () => { render(<UserMenu user={user} onLogout={vi.fn()} />); expect(screen.getByAltText('John')).toBeInTheDocument(); });
  it('opens menu', () => { render(<UserMenu user={user} onLogout={vi.fn()} />); fireEvent.click(screen.getByRole('button')); expect(screen.getByText('john@test.com')).toBeInTheDocument(); });
  it('logout', () => { const onLogout = vi.fn(); render(<UserMenu user={user} onLogout={onLogout} />); fireEvent.click(screen.getByRole('button')); fireEvent.click(screen.getByText(/logout/i)); expect(onLogout).toHaveBeenCalled(); });
});