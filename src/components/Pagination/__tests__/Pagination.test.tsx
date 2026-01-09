import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Pagination } from '../Pagination';

describe('Pagination', () => {
  it('renders page numbers', () => {
    render(<Pagination total={100} page={1} pageSize={10} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('handles page change', () => {
    const onChange = vi.fn();
    render(<Pagination total={50} page={1} pageSize={10} onChange={onChange} />);
    fireEvent.click(screen.getByText('2'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('disables prev on first page', () => {
    render(<Pagination total={50} page={1} pageSize={10} />);
    expect(screen.getByLabelText('Previous')).toBeDisabled();
  });

  it('disables next on last page', () => {
    render(<Pagination total={50} page={5} pageSize={10} />);
    expect(screen.getByLabelText('Next')).toBeDisabled();
  });
});