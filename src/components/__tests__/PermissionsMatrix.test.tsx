import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PermissionsMatrix } from '../PermissionsMatrix';
describe('PermissionsMatrix', () => {
  const roles = ['admin', 'user'];
  const permissions = ['read', 'write', 'delete'];
  const matrix = { admin: { read: true, write: true, delete: true }, user: { read: true, write: false, delete: false } };
  it('renders matrix', () => { render(<PermissionsMatrix roles={roles} permissions={permissions} matrix={matrix} onChange={vi.fn()} />); expect(screen.getByText('admin')).toBeInTheDocument(); });
  it('shows checkboxes', () => { render(<PermissionsMatrix roles={roles} permissions={permissions} matrix={matrix} onChange={vi.fn()} />); expect(screen.getAllByRole('checkbox')).toHaveLength(6); });
  it('toggles permission', () => { const onChange = vi.fn(); render(<PermissionsMatrix roles={roles} permissions={permissions} matrix={matrix} onChange={onChange} />); fireEvent.click(screen.getAllByRole('checkbox')[3]); expect(onChange).toHaveBeenCalled(); });
});