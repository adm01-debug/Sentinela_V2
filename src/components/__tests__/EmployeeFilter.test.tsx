import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmployeeFilter } from '../EmployeeFilter';
describe('EmployeeFilter', () => {
  const filters = { department: '', status: '', search: '' };
  it('renders filters', () => { render(<EmployeeFilter filters={filters} onChange={vi.fn()} />); expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument(); });
  it('filters by search', () => { const onChange = vi.fn(); render(<EmployeeFilter filters={filters} onChange={onChange} />); fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: 'John' } }); expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ search: 'John' })); });
  it('filters by department', () => { const onChange = vi.fn(); render(<EmployeeFilter filters={filters} onChange={onChange} departments={['Engineering']} />); fireEvent.click(screen.getByRole('combobox')); fireEvent.click(screen.getByText('Engineering')); expect(onChange).toHaveBeenCalled(); });
  it('resets filters', () => { const onChange = vi.fn(); render(<EmployeeFilter filters={{ ...filters, search: 'test' }} onChange={onChange} />); fireEvent.click(screen.getByText(/reset/i)); expect(onChange).toHaveBeenCalledWith({ department: '', status: '', search: '' }); });
});