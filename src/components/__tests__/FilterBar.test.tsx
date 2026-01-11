import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from '../FilterBar';
describe('FilterBar', () => {
  const filters = [{ key: 'status', label: 'Status', options: ['active', 'inactive'] }];
  it('renders filters', () => { render(<FilterBar filters={filters} onChange={vi.fn()} />); expect(screen.getByText('Status')).toBeInTheDocument(); });
  it('applies filter', () => { const onChange = vi.fn(); render(<FilterBar filters={filters} onChange={onChange} />); fireEvent.click(screen.getByText('Status')); fireEvent.click(screen.getByText('active')); expect(onChange).toHaveBeenCalled(); });
  it('shows active filter count', () => { render(<FilterBar filters={filters} activeFilters={{ status: 'active' }} onChange={vi.fn()} />); expect(screen.getByText('1')).toBeInTheDocument(); });
  it('clears all filters', () => { const onChange = vi.fn(); render(<FilterBar filters={filters} activeFilters={{ status: 'active' }} onChange={onChange} />); fireEvent.click(screen.getByText(/clear all/i)); expect(onChange).toHaveBeenCalledWith({}); });
});