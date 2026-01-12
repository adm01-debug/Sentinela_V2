import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('should render online status', () => {
    const { container } = render(<StatusBadge status="online" />);
    expect(container.querySelector('.bg-green-500')).toBeTruthy();
  });

  it('should render offline status', () => {
    const { container } = render(<StatusBadge status="offline" />);
    expect(container.querySelector('.bg-gray-400')).toBeTruthy();
  });

  it('should show label when enabled', () => {
    render(<StatusBadge status="online" showLabel />);
    expect(screen.getByText('Online')).toBeInTheDocument();
  });
});
