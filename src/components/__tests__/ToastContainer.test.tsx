import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToastContainer } from '../ToastContainer';
describe('ToastContainer', () => {
  const toasts = [{ id: '1', message: 'Toast 1', type: 'success' }, { id: '2', message: 'Toast 2', type: 'error' }];
  it('renders toasts', () => { render(<ToastContainer toasts={toasts} onDismiss={() => {}} />); expect(screen.getByText('Toast 1')).toBeInTheDocument(); expect(screen.getByText('Toast 2')).toBeInTheDocument(); });
  it('positions top-right', () => { const { container } = render(<ToastContainer toasts={toasts} position="top-right" onDismiss={() => {}} />); expect(container.firstChild).toHaveClass('top-right'); });
  it('empty when no toasts', () => { const { container } = render(<ToastContainer toasts={[]} onDismiss={() => {}} />); expect(container.firstChild.children).toHaveLength(0); });
});