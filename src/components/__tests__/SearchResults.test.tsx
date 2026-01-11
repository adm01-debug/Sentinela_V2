import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchResults } from '../SearchResults';
describe('SearchResults', () => {
  const results = [{ id: '1', title: 'Result 1', type: 'employee' }, { id: '2', title: 'Result 2', type: 'report' }];
  it('renders results', () => { render(<SearchResults results={results} onSelect={vi.fn()} />); expect(screen.getByText('Result 1')).toBeInTheDocument(); });
  it('shows type', () => { render(<SearchResults results={results} onSelect={vi.fn()} />); expect(screen.getByText('employee')).toBeInTheDocument(); });
  it('handles select', () => { const onSelect = vi.fn(); render(<SearchResults results={results} onSelect={onSelect} />); fireEvent.click(screen.getByText('Result 1')); expect(onSelect).toHaveBeenCalled(); });
  it('empty state', () => { render(<SearchResults results={[]} onSelect={vi.fn()} />); expect(screen.getByText(/no results/i)).toBeInTheDocument(); });
});