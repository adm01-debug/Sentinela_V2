import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../Pagination';

describe('Pagination', () => {
  it('should display current page', () => {
    render(<Pagination currentPage={3} totalPages={10} onPageChange={vi.fn()} />);
    expect(screen.getByText('3 de 10')).toBeInTheDocument();
  });

  it('should call onPageChange when clicking next', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={1} totalPages={10} onPageChange={onPageChange} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[2]); // Next button
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('should disable prev on first page', () => {
    render(<Pagination currentPage={1} totalPages={10} onPageChange={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
  });
});
