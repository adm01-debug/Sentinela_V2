import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Table } from '../Table';

describe('Table', () => {
  const columns = [{ key: 'name', title: 'Name' }, { key: 'email', title: 'Email' }];
  const data = [{ id: 1, name: 'John', email: 'john@test.com' }];

  it('renders headers', () => {
    render(<Table columns={columns} data={data} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    render(<Table columns={columns} data={data} />);
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('john@test.com')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<Table columns={columns} data={[]} loading />);
    expect(screen.getByTestId('table-loading')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(<Table columns={columns} data={[]} emptyText="No data" />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('handles row selection', () => {
    const onSelect = vi.fn();
    render(<Table columns={columns} data={data} selectable onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onSelect).toHaveBeenCalled();
  });
});