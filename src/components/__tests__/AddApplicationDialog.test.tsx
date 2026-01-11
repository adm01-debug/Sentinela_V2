import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddApplicationDialog } from '../AddApplicationDialog';

describe('AddApplicationDialog', () => {
  it('renders dialog when open', () => {
    render(<AddApplicationDialog open onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
  it('calls onClose when cancel clicked', () => {
    const onClose = vi.fn();
    render(<AddApplicationDialog open onClose={onClose} />);
    fireEvent.click(screen.getByText(/cancel/i));
    expect(onClose).toHaveBeenCalled();
  });
  it('validates required fields', async () => {
    render(<AddApplicationDialog open onClose={vi.fn()} />);
    fireEvent.click(screen.getByText(/save/i));
    expect(await screen.findByText(/required/i)).toBeInTheDocument();
  });
  it('submits form with valid data', async () => {
    const onSubmit = vi.fn();
    render(<AddApplicationDialog open onClose={vi.fn()} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test App' } });
    fireEvent.click(screen.getByText(/save/i));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test App' }));
  });
});