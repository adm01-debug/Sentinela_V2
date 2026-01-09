import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from '../Modal';

describe('Modal', () => {
  it('renders when open', () => {
    render(<Modal isOpen title="Test Modal">Content</Modal>);
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<Modal isOpen={false} title="Hidden">Content</Modal>);
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });

  it('calls onClose when clicking backdrop', () => {
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose}>Content</Modal>);
    fireEvent.click(screen.getByTestId('modal-backdrop'));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders footer actions', () => {
    render(<Modal isOpen footer={<button>Save</button>}>Content</Modal>);
    expect(screen.getByText('Save')).toBeInTheDocument();
  });
});