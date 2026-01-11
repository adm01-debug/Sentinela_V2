import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DepartmentSelector } from '../DepartmentSelector';
describe('DepartmentSelector', () => {
  const depts = [{ id: '1', name: 'Engineering' }, { id: '2', name: 'Sales' }];
  it('renders selector', () => { render(<DepartmentSelector departments={depts} onChange={vi.fn()} />); expect(screen.getByRole('combobox')).toBeInTheDocument(); });
  it('shows departments', () => { render(<DepartmentSelector departments={depts} onChange={vi.fn()} />); fireEvent.click(screen.getByRole('combobox')); expect(screen.getByText('Engineering')).toBeInTheDocument(); });
  it('selects department', () => { const onChange = vi.fn(); render(<DepartmentSelector departments={depts} onChange={onChange} />); fireEvent.click(screen.getByRole('combobox')); fireEvent.click(screen.getByText('Engineering')); expect(onChange).toHaveBeenCalledWith('1'); });
});