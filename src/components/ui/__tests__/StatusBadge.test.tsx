import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders label', () => {
    render(<StatusBadge status="success" label="Active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies success styles', () => {
    render(<StatusBadge status="success" label="Active" />);
    const badge = screen.getByText('Active');
    expect(badge.className).toContain('green');
  });

  it('applies error styles', () => {
    render(<StatusBadge status="error" label="Error" />);
    const badge = screen.getByText('Error');
    expect(badge.className).toContain('red');
  });
});
