import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToastContainer } from '../ToastContainer';

vi.mock('@/stores/toastStore', () => ({
  useToastStore: () => ({
    toasts: [{ id: '1', type: 'success', title: 'Success', message: 'Operation completed' }],
    removeToast: vi.fn(),
  }),
}));

describe('ToastContainer', () => {
  it('should render toasts', () => {
    render(<ToastContainer />);
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Operation completed')).toBeInTheDocument();
  });
});
