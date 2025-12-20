import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from '../FilterBar';

describe('FilterBar', () => {
  it('renders search input', () => {
    render(<FilterBar searchValue="" onSearchChange={vi.fn()} />);
    expect(screen.getByPlaceholder('Buscar...')).toBeInTheDocument();
  });

  it('calls onSearchChange when typing', () => {
    const onChange = vi.fn();
    render(<FilterBar searchValue="" onSearchChange={onChange} />);
    fireEvent.change(screen.getByPlaceholder('Buscar...'), { target: { value: 'test' } });
    expect(onChange).toHaveBeenCalledWith('test');
  });

  it('renders filters', () => {
    const filters = [{
      key: 'status',
      placeholder: 'Status',
      options: [{ value: 'all', label: 'All' }, { value: 'active', label: 'Active' }],
      value: 'all',
      onChange: vi.fn(),
    }];
    render(<FilterBar filters={filters} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<FilterBar><button>Custom</button></FilterBar>);
    expect(screen.getByRole('button', { name: 'Custom' })).toBeInTheDocument();
  });
});
