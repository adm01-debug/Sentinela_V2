import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from '../ConfirmDialog';
describe('ConfirmDialog', () => {
  it('renders dialog', () => { render(<ConfirmDialog open title="Confirm" onConfirm={vi.fn()} onCancel={vi.fn()} />); expect(screen.getByText('Confirm')).toBeInTheDocument(); });
  it('calls onConfirm', () => { const onConfirm = vi.fn(); render(<ConfirmDialog open title="Test" onConfirm={onConfirm} onCancel={vi.fn()} />); fireEvent.click(screen.getByText(/confirm/i)); expect(onConfirm).toHaveBeenCalled(); });
  it('calls onCancel', () => { const onCancel = vi.fn(); render(<ConfirmDialog open title="Test" onConfirm={vi.fn()} onCancel={onCancel} />); fireEvent.click(screen.getByText(/cancel/i)); expect(onCancel).toHaveBeenCalled(); });
  it('shows description', () => { render(<ConfirmDialog open title="Test" description="Are you sure?" onConfirm={vi.fn()} onCancel={vi.fn()} />); expect(screen.getByText('Are you sure?')).toBeInTheDocument(); });
});