import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SortableTable } from '../SortableTable';
describe('SortableTable', () => {
  const columns = [{ key: 'name', label: 'Name', sortable: true }];
  const data = [{ id: '1', name: 'John' }, { id: '2', name: 'Jane' }];
  it('renders', () => { render(<SortableTable columns={columns} data={data} />); expect(screen.getByRole('table')).toBeInTheDocument(); });
  it('sorts on click', () => { const onSort = vi.fn(); render(<SortableTable columns={columns} data={data} onSort={onSort} />); fireEvent.click(screen.getByText('Name')); expect(onSort).toHaveBeenCalled(); });
  it('shows sort indicator', () => { render(<SortableTable columns={columns} data={data} sortBy="name" sortOrder="asc" />); expect(screen.getByTestId('sort-asc')).toBeInTheDocument(); });
});