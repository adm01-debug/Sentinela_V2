import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from '../DataTable';
describe('DataTable', () => {
  const columns = [{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }];
  const data = [{ id: 1, name: 'John', email: 'john@test.com' }];
  it('renders table', () => { render(<DataTable columns={columns} data={data} />); expect(screen.getByRole('table')).toBeInTheDocument(); });
  it('renders columns', () => { render(<DataTable columns={columns} data={data} />); expect(screen.getByText('Name')).toBeInTheDocument(); });
  it('renders data', () => { render(<DataTable columns={columns} data={data} />); expect(screen.getByText('John')).toBeInTheDocument(); });
  it('handles sorting', () => { const onSort = vi.fn(); render(<DataTable columns={columns} data={data} onSort={onSort} sortable />); fireEvent.click(screen.getByText('Name')); expect(onSort).toHaveBeenCalled(); });
  it('shows empty state', () => { render(<DataTable columns={columns} data={[]} />); expect(screen.getByText(/no data/i)).toBeInTheDocument(); });
});