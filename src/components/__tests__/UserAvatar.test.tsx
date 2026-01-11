import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserAvatar } from '../UserAvatar';
describe('UserAvatar', () => {
  it('renders image', () => { render(<UserAvatar src="/avatar.jpg" alt="John" />); expect(screen.getByAltText('John')).toBeInTheDocument(); });
  it('shows initials', () => { render(<UserAvatar name="John Doe" />); expect(screen.getByText('JD')).toBeInTheDocument(); });
  it('applies size', () => { const { container } = render(<UserAvatar name="John" size="lg" />); expect(container.firstChild).toHaveClass('w-12 h-12'); });
  it('shows online status', () => { render(<UserAvatar name="John" status="online" />); expect(screen.getByTestId('status-dot')).toHaveClass('bg-green'); });
});