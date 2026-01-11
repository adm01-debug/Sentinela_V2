import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../Pagination';
describe('Pagination', () => {
  it('renders', () => { render(<Pagination current={1} total={100} pageSize={10} onChange={vi.fn()} />); expect(screen.getByText('1')).toBeInTheDocument(); });
  it('navigates', () => { const fn = vi.fn(); render(<Pagination current={1} total={100} pageSize={10} onChange={fn} />); fireEvent.click(screen.getByText('2')); expect(fn).toHaveBeenCalledWith(2); });
});