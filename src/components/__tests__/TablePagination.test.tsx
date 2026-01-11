import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TablePagination } from '../TablePagination';
describe('TablePagination', () => {
  it('renders', () => { render(<TablePagination page={1} totalPages={10} onPageChange={vi.fn()} />); expect(screen.getByText('1')).toBeInTheDocument(); });
  it('next page', () => { const onChange = vi.fn(); render(<TablePagination page={1} totalPages={10} onPageChange={onChange} />); fireEvent.click(screen.getByRole('button', { name: /next/i })); expect(onChange).toHaveBeenCalledWith(2); });
  it('prev page', () => { const onChange = vi.fn(); render(<TablePagination page={5} totalPages={10} onPageChange={onChange} />); fireEvent.click(screen.getByRole('button', { name: /prev/i })); expect(onChange).toHaveBeenCalledWith(4); });
  it('disables prev on first', () => { render(<TablePagination page={1} totalPages={10} onPageChange={vi.fn()} />); expect(screen.getByRole('button', { name: /prev/i })).toBeDisabled(); });
});