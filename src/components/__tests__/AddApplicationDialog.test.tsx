import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddApplicationDialog } from '../AddApplicationDialog';

describe('AddApplicationDialog', () => {
  it('renders dialog trigger', () => {
    render(<AddApplicationDialog onAdd={vi.fn()} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('opens dialog on trigger click', () => {
    render(<AddApplicationDialog onAdd={vi.fn()} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/Adicionar/i)).toBeInTheDocument();
  });

  it('calls onAdd with form data', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<AddApplicationDialog onAdd={onAdd} />);
    
    // Open dialog
    fireEvent.click(screen.getByRole('button'));
    
    // Fill in name field
    const nameInput = screen.getByPlaceholderText(/nome/i);
    fireEvent.change(nameInput, { target: { value: 'Test App' } });
    
    // Submit form
    const addButton = screen.getByRole('button', { name: /Adicionar$/i });
    fireEvent.click(addButton);
    
    // Wait for async operation
    await vi.waitFor(() => {
      expect(onAdd).toHaveBeenCalled();
    });
  });
});
