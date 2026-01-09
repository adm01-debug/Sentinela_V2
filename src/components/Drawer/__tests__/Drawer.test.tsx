import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Drawer } from '../Drawer';

describe('Drawer', () => {
  it('renders when open', () => {
    render(<Drawer isOpen>Drawer content</Drawer>);
    expect(screen.getByText('Drawer content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<Drawer isOpen={false}>Hidden</Drawer>);
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });

  it('calls onClose when clicking backdrop', () => {
    const onClose = vi.fn();
    render(<Drawer isOpen onClose={onClose}>Content</Drawer>);
    fireEvent.click(screen.getByTestId('drawer-backdrop'));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders title', () => {
    render(<Drawer isOpen title="Drawer Title">Content</Drawer>);
    expect(screen.getByText('Drawer Title')).toBeInTheDocument();
  });

  it('applies placement', () => {
    render(<Drawer isOpen placement="left">Content</Drawer>);
    expect(screen.getByTestId('drawer')).toHaveClass('left');
  });
});