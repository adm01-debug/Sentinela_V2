import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from '../ConfirmDialog';

const mockDialog = { title: 'Confirm?', message: 'Are you sure?', onConfirm: vi.fn(), confirmText: 'Yes', cancelText: 'No' };

vi.mock('@/stores/modalStore', () => ({
  useModalStore: () => ({ confirmDialog: mockDialog, closeConfirmDialog: vi.fn() }),
}));

describe('ConfirmDialog', () => {
  it('should render dialog content', () => {
    render(<ConfirmDialog />);
    expect(screen.getByText('Confirm?')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('should show confirm and cancel buttons', () => {
    render(<ConfirmDialog />);
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });
});
