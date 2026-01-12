import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserAvatar } from '../UserAvatar';

describe('UserAvatar', () => {
  it('should render initials when no image', () => {
    render(<UserAvatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should render image when src provided', () => {
    render(<UserAvatar name="John Doe" src="/avatar.jpg" />);
    expect(screen.getByRole('img')).toHaveAttribute('src', '/avatar.jpg');
  });

  it('should handle single name', () => {
    render(<UserAvatar name="Admin" />);
    expect(screen.getByText('AD')).toBeInTheDocument();
  });
});
