import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoleSelector } from '../RoleSelector';
describe('RoleSelector', () => {
  const roles = [{ id: '1', name: 'Admin' }, { id: '2', name: 'User' }];
  it('renders', () => { render(<RoleSelector roles={roles} value="1" onChange={vi.fn()} />); expect(screen.getByRole('combobox')).toBeInTheDocument(); });
  it('shows selected', () => { render(<RoleSelector roles={roles} value="1" onChange={vi.fn()} />); expect(screen.getByText('Admin')).toBeInTheDocument(); });
  it('changes role', () => { const onChange = vi.fn(); render(<RoleSelector roles={roles} value="1" onChange={onChange} />); fireEvent.click(screen.getByRole('combobox')); fireEvent.click(screen.getByText('User')); expect(onChange).toHaveBeenCalledWith('2'); });
});