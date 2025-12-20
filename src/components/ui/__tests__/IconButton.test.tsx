import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IconButton } from '../IconButton';
import { Edit } from 'lucide-react';

describe('IconButton', () => {
  it('renders icon', () => {
    render(<IconButton icon={Edit} />);
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('handles click', () => {
    const onClick = vi.fn();
    render(<IconButton icon={Edit} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('applies custom icon className', () => {
    render(<IconButton icon={Edit} iconClassName="text-red-500" />);
    expect(document.querySelector('svg')).toHaveClass('text-red-500');
  });

  it('renders with tooltip', () => {
    render(<IconButton icon={Edit} tooltip="Edit item" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
