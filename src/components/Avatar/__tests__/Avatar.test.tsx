import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Avatar } from '../Avatar';

describe('Avatar', () => {
  it('renders image when src provided', () => {
    render(<Avatar src="/avatar.jpg" alt="User" />);
    expect(screen.getByAltText('User')).toBeInTheDocument();
  });

  it('renders initials when no src', () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('shows status indicator', () => {
    render(<Avatar name="JD" status="online" />);
    expect(screen.getByTestId('avatar-status')).toHaveClass('online');
  });

  it('applies size classes', () => {
    render(<Avatar name="JD" size="lg" />);
    expect(screen.getByTestId('avatar')).toHaveClass('lg');
  });
});