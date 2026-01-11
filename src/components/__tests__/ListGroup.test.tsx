import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ListGroup } from '../ListGroup';
describe('ListGroup', () => {
  const items = [{ id: '1', label: 'Item 1' }, { id: '2', label: 'Item 2' }];
  it('renders', () => { render(<ListGroup items={items} />); expect(screen.getByText('Item 1')).toBeInTheDocument(); });
  it('selects', () => { const fn = vi.fn(); render(<ListGroup items={items} onSelect={fn} />); fireEvent.click(screen.getByText('Item 1')); expect(fn).toHaveBeenCalledWith('1'); });
});