import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmployeeSearch } from '../EmployeeSearch';
describe('EmployeeSearch', () => {
  it('renders search input', () => { render(<EmployeeSearch onSearch={vi.fn()} />); expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument(); });
  it('calls onSearch on input', async () => { const onSearch = vi.fn(); render(<EmployeeSearch onSearch={onSearch} />); fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: 'John' } }); await waitFor(() => expect(onSearch).toHaveBeenCalledWith('John')); });
  it('shows clear button', () => { render(<EmployeeSearch onSearch={vi.fn()} value="test" />); expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument(); });
  it('clears search', () => { const onSearch = vi.fn(); render(<EmployeeSearch onSearch={onSearch} value="test" />); fireEvent.click(screen.getByRole('button', { name: /clear/i })); expect(onSearch).toHaveBeenCalledWith(''); });
});