import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('renders text', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('applies variant styles', () => {
    render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success')).toHaveClass('success');
  });

  it('shows dot indicator', () => {
    render(<Badge dot>Active</Badge>);
    expect(screen.getByTestId('badge-dot')).toBeInTheDocument();
  });

  it('handles remove action', () => {
    const onRemove = vi.fn();
    render(<Badge removable onRemove={onRemove}>Tag</Badge>);
    fireEvent.click(screen.getByTestId('badge-remove'));
    expect(onRemove).toHaveBeenCalled();
  });
});