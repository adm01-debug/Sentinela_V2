import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateRangePicker } from '../DateRangePicker';
describe('DateRangePicker', () => {
  it('renders picker', () => { render(<DateRangePicker onChange={vi.fn()} />); expect(screen.getByRole('textbox')).toBeInTheDocument(); });
  it('opens calendar on click', () => { render(<DateRangePicker onChange={vi.fn()} />); fireEvent.click(screen.getByRole('textbox')); expect(screen.getByRole('dialog')).toBeInTheDocument(); });
  it('selects date range', () => { const onChange = vi.fn(); render(<DateRangePicker onChange={onChange} />); fireEvent.click(screen.getByRole('textbox')); fireEvent.click(screen.getByText('15')); expect(onChange).toHaveBeenCalled(); });
  it('shows presets', () => { render(<DateRangePicker onChange={vi.fn()} showPresets />); fireEvent.click(screen.getByRole('textbox')); expect(screen.getByText(/last 7 days/i)).toBeInTheDocument(); });
});