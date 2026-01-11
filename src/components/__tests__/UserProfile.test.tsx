import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfile } from '../UserProfile';
describe('UserProfile', () => {
  const user = { name: 'John Doe', email: 'john@test.com', role: 'Admin', avatar: '/avatar.jpg' };
  it('renders', () => { render(<UserProfile user={user} />); expect(screen.getByText('John Doe')).toBeInTheDocument(); });
  it('shows role', () => { render(<UserProfile user={user} />); expect(screen.getByText('Admin')).toBeInTheDocument(); });
  it('edits profile', () => { const onEdit = vi.fn(); render(<UserProfile user={user} onEdit={onEdit} />); fireEvent.click(screen.getByText(/edit/i)); expect(onEdit).toHaveBeenCalled(); });
});