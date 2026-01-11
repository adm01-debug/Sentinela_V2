import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GlobalSearch } from '../GlobalSearch';
describe('GlobalSearch', () => {
  it('renders search', () => { render(<GlobalSearch />); expect(screen.getByRole('searchbox')).toBeInTheDocument(); });
  it('opens on keyboard shortcut', () => { render(<GlobalSearch />); fireEvent.keyDown(document, { key: 'k', metaKey: true }); expect(screen.getByRole('dialog')).toBeInTheDocument(); });
  it('shows results', async () => { const onSearch = vi.fn().mockResolvedValue([{ id: '1', title: 'Result 1' }]); render(<GlobalSearch onSearch={onSearch} />); fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'test' } }); await waitFor(() => expect(screen.getByText('Result 1')).toBeInTheDocument()); });
  it('navigates results with keyboard', () => { render(<GlobalSearch results={[{ id: '1', title: 'R1' }, { id: '2', title: 'R2' }]} />); fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'ArrowDown' }); expect(screen.getByText('R1').parentElement).toHaveClass('selected'); });
});