import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from '../DataTable';

const data = [{ id: '1', name: 'Item 1' }, { id: '2', name: 'Item 2' }];
const columns = [{ key: 'name', header: 'Name' }];

describe('DataTable', () => {
  it('should render table with data', () => {
    render(<DataTable data={data} columns={columns} />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should show empty state when no data', () => {
    render(<DataTable data={[]} columns={columns} emptyMessage="No items" />);
    expect(screen.getByText('No items')).toBeInTheDocument();
  });

  it('should handle row click', () => {
    const onRowClick = vi.fn();
    render(<DataTable data={data} columns={columns} onRowClick={onRowClick} />);
    fireEvent.click(screen.getByText('Item 1'));
    expect(onRowClick).toHaveBeenCalledWith(data[0]);
  });
});
