import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GlobalSearch } from '../GlobalSearch';

vi.mock('@/stores/searchStore', () => ({
  useSearchStore: () => ({
    query: '',
    setQuery: vi.fn(),
    results: [{ id: '1', title: 'Result 1', type: 'Employee', url: '/e/1' }],
    isLoading: false,
    search: vi.fn(),
    clear: vi.fn(),
  }),
}));

describe('GlobalSearch', () => {
  it('should render search input', () => {
    render(<GlobalSearch />);
    expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument();
  });

  it('should show results', () => {
    render(<GlobalSearch />);
    const input = screen.getByPlaceholderText(/buscar/i);
    fireEvent.focus(input);
    expect(screen.getByText('Result 1')).toBeInTheDocument();
  });
});
