import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MonthPicker } from '../MonthPicker';
describe('MonthPicker', () => {
  it('renders', () => { render(<MonthPicker value="2026-01" onChange={vi.fn()} />); expect(screen.getByText('January 2026')).toBeInTheDocument(); });
  it('changes month', () => { const fn = vi.fn(); render(<MonthPicker value="2026-01" onChange={fn} />); fireEvent.click(screen.getByText(/next/i)); expect(fn).toHaveBeenCalled(); });
});